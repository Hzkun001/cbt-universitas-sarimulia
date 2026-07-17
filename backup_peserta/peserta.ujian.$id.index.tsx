import {
	createFileRoute,
	Link,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import {
	AlertTriangle,
	CalendarClock,
	CalendarX,
	Clock,
	RefreshCw,
	ShieldOff,
    FileText
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RichView } from "@/components/cbt/RichEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	isParticipantAssignedToExam,
	PesertaNotAssignedToExamError,
} from "@/lib/cbt/access";
import { useAuthStore } from "@/lib/cbt/auth-store";
import {
	getExamAvailabilityMessage,
	getExamAvailabilityStatus,
	isExamAvailable,
} from "@/lib/cbt/availability";
import { findOrCreateSesi, startSesi } from "@/lib/cbt/exam";
import {
	claimExamToken,
	hydrateRepos,
	invalidateReposCache,
	sesiRepo,
	tokenRepo,
	ujianRepo,
} from "@/lib/cbt/repos";

export const Route = createFileRoute("/_authenticated/peserta/ujian/$id/")({
	loader: async () => {
		// Ensure the peserta-side snapshot is up to date. The cache is
		// server-side filtered to only ujian the participant's group is
		// allowed to see, so a direct URL to a blocked ujian will not be
		// in the local cache; we still need `user` to be present for the
		// policy check below.
		try {
			invalidateReposCache();
			await hydrateRepos();
		} catch {
			// Cache may already be hydrated or the snapshot endpoint is
			// temporarily unavailable; fall through and let the component
			// render the locked state.
		}
	},
	component: PreUjian,
});

function PreUjian() {
	const { id } = useParams({ from: "/_authenticated/peserta/ujian/$id/" });
	const user = useAuthStore((s) => s.user);
	const ujian = ujianRepo.byId(id);

	if (!user) return <div>Pengguna tidak ditemukan</div>;

	// Direct-URL guard (Issue #8). The dashboard already filters exams by
	// group, but a participant who knows/guesses an id can otherwise open
	// this route, redeem a token, and start a session. Block before any
	// side-effects so the assignment policy is enforced at the route layer.
	//
	// The peserta-side snapshot strips ujian the participant's group is
	// not allowed to see, so `ujianRepo.byId(id)` returns `undefined` for
	// a blocked (or non-existent) ujian. In both cases the participant
	// must not see the exam content; render the blocked card.
	if (!ujian || !isParticipantAssignedToExam(user, ujian)) {
		return <PreUjianBlocked user={user} ujian={ujian} />;
	}

	return <PreUjianContent user={user} ujian={ujian} />;
}

function PreUjianBlocked({
	user,
	ujian,
}: {
	user: NonNullable<ReturnType<typeof useAuthStore.getState>["user"]>;
	ujian: NonNullable<ReturnType<typeof ujianRepo.byId>> | undefined;
}) {
	return (
		<div className="max-w-2xl mx-auto space-y-4">
			<Link
				to="/peserta"
				className="text-sm text-muted-foreground hover:underline"
			>
				← Daftar ujian
			</Link>
			<h1 className="text-2xl font-semibold tracking-tight">
				{ujian ? ujian.nama : "Ujian tidak tersedia"}
			</h1>
			<Card>
				<CardContent className="p-4 space-y-3">
					<div
						role="alert"
						data-testid="peserta-not-assigned-blocked"
						className="rounded border border-destructive/30 bg-destructive/10 p-3 text-sm space-y-1"
					>
						<div className="flex items-center gap-2 font-medium">
							<ShieldOff className="h-4 w-4" />
							Anda tidak terdaftar pada ujian ini
						</div>
						<p className="text-xs text-muted-foreground">
							Ujian ini tidak di-assign ke kelompok Anda. Hubungi pengawas atau
							operator jika Anda merasa seharusnya memiliki akses.
						</p>
					</div>
					<div className="text-xs text-muted-foreground">
						Login sebagai{" "}
						<span className="font-medium">{user.namaLengkap}</span> (
						{user.username})
					</div>
					<Button asChild variant="outline" className="w-full">
						<Link to="/peserta">Kembali ke daftar ujian</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

function PreUjianContent({
	user,
	ujian,
}: {
	user: NonNullable<ReturnType<typeof useAuthStore.getState>["user"]>;
	ujian: NonNullable<ReturnType<typeof ujianRepo.byId>>;
}) {
	const navigate = useNavigate();
	const [token, setToken] = useState("");
	const [agree, setAgree] = useState(false);
	const tokenInputId = `token-ujian-${ujian.id}`;
	const availability = getExamAvailabilityStatus(ujian);
	const examAllowed = isExamAvailable(ujian);
	const blockedMessage = getExamAvailabilityMessage(availability, ujian);
	const BlockedIcon = availability === "upcoming" ? CalendarClock : CalendarX;

	const sesiSelesai = sesiRepo
		.all()
		.find(
			(s) =>
				s.ujianId === ujian.id &&
				s.pesertaId === user.id &&
				s.status === "selesai",
		);
	const sesiAktif = sesiRepo
		.all()
		.find(
			(s) =>
				s.ujianId === ujian.id &&
				s.pesertaId === user.id &&
				s.status === "sedang",
		);

	async function mulai() {
		if (!examAllowed) {
			toast.error(blockedMessage || "Ujian tidak dapat dimulai saat ini");
			return;
		}
		if (!agree) {
			toast.error("Centang persetujuan dulu");
			return;
		}
		if (ujian.tokenAktif) {
			const kode = token.trim().toUpperCase();
			if (kode.length === 0) {
				toast.error("Masukkan token");
				return;
			}
			// Advisory pre-check only: surface an obvious "already used by someone
			// else" from the local cache for a snappier message. On a cache miss or
			// any stale state we FALL THROUGH to the server — `claimExamToken` is the
			// sole authority and must not be short-circuited by the client cache
			// (e.g. a token generated after this client hydrated).
			const tokenRow = tokenRepo
				.all()
				.find((t) => t.ujianId === ujian.id && t.kode.toUpperCase() === kode);
			if (tokenRow?.dipakaiOleh && tokenRow.dipakaiOleh !== user.id) {
				toast.error("Token sudah dipakai peserta lain");
				return;
			}
			// Atomic claim (Issue #9): must succeed before any session is created.
			// Two participants racing the same unused token cannot both win here.
			const claim = await claimExamToken(ujian.id, kode);
			if (!claim.ok) {
				toast.error(claim.error);
				return;
			}
		}
		if (ujian.fullscreenWajib) {
			try {
				await document.documentElement.requestFullscreen();
			} catch {
				/* ignore */
			}
		}
		try {
			const sesi = findOrCreateSesi(ujian.id, user.id, user);
			const started = sesi.status === "sedang" ? sesi : startSesi(sesi, ujian);
			sesiRepo.upsert(started);
			const flushResult = await sesiRepo.flush();
			if (!flushResult.ok) {
				toast.error("Gagal menyimpan sesi ke server: " + flushResult.error);
				return;
			}
			navigate({ to: "/peserta/ujian/$id/kerjakan", params: { id: ujian.id } });
		} catch (err) {
			if (err instanceof PesertaNotAssignedToExamError) {
				toast.error("Anda tidak terdaftar pada ujian ini");
				window.location.href = "/peserta";
				return;
			}
			console.error("Gagal memulai ujian:", err);
			toast.error(err instanceof Error ? err.message : "Gagal memulai ujian. Silakan coba lagi.");
			return;
		}
	}

	return (
		<div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<Link
				to="/peserta"
				className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
			>
				&larr; Kembali ke Daftar Ujian
			</Link>
			
			<Card className="border-none shadow-lg bg-white overflow-hidden rounded-xl">
                <div className="bg-[#03A559] px-6 py-4 text-white">
				    <h1 className="text-xl md:text-2xl font-extrabold tracking-tight mb-2 leading-tight">{ujian.nama}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-white/90 font-medium">
						<span className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-xs">
                            <Clock className="h-3.5 w-3.5" /> Durasi {ujian.durasiMenit} menit
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-xs">
                            <FileText className="h-3.5 w-3.5" /> {ujian.topicSets.reduce((a, b) => a + b.jumlah, 0)} soal
                        </span>
					</div>
                </div>

				<CardContent className="p-6 space-y-5">
                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
					    <RichView html={ujian.deskripsi || "<p><em>Tidak ada deskripsi.</em></p>"} />
                    </div>

					{!examAllowed && (
						<div
							role="alert"
							className="flex gap-4 rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm"
						>
                            <BlockedIcon className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
							<div>
                                <h4 className="font-bold text-red-800 text-lg">
                                    {availability === "upcoming" ? "Ujian Belum Dimulai" : "Ujian Sudah Berakhir"}
                                </h4>
							    <p className="text-sm text-red-600 mt-1">{blockedMessage}</p>
                            </div>
						</div>
					)}
					
					{sesiAktif && (
						<div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm text-blue-900 font-medium text-sm">
							Anda sedang mengerjakan ujian ini.{" "}
							<Link
								to="/peserta/ujian/$id/kerjakan"
								params={{ id: ujian.id }}
								className="text-blue-700 underline font-bold"
							>
								Lanjutkan mengerjakan &rarr;
							</Link>
						</div>
					)}
					
					{sesiSelesai && (
						<div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm text-green-900 font-medium text-sm">
							Anda sudah menyelesaikan ujian ini.{" "}
							<Link
								to="/peserta/ujian/$id/hasil"
								params={{ id: ujian.id }}
								className="text-green-700 underline font-bold"
							>
								Lihat hasil
							</Link>
							. Tekan tombol di bawah jika ingin mengerjakan ulang.
						</div>
					)}

                    {/* Aturan Box */}
					<div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
						<div className="flex items-center gap-2 font-bold text-amber-800 mb-2 text-sm">
							<AlertTriangle className="h-4 w-4" />
							Aturan Pelaksanaan
						</div>
						<ul className="space-y-1.5 text-xs text-amber-900/80 font-medium ml-1">
							{ujian.fullscreenWajib && (
								<li className="flex items-start gap-2">
                                    <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" /> 
                                    Wajib dalam mode layar penuh (Fullscreen).
                                </li>
							)}
							{ujian.maxPindahTab > 0 && (
								<li className="flex items-start gap-2">
                                    <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" /> 
									Pindah tab/aplikasi maksimal {ujian.maxPindahTab} kali, lebih dari itu otomatis tersubmit.
								</li>
							)}
							{ujian.blokirShortcut && (
								<li className="flex items-start gap-2">
                                    <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" /> 
                                    Copy, Paste, dan Klik Kanan dinonaktifkan.
                                </li>
							)}
							<li className="flex items-start gap-2">
                                <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" /> 
                                Waktu berjalan sejak menekan tombol mulai.
                            </li>
						</ul>
					</div>

					{ujian.tokenAktif && (
						<div className="space-y-2">
							<Label htmlFor={tokenInputId} className="text-xs font-bold text-gray-700">Token Ujian (Wajib)</Label>
							<Input
								id={tokenInputId}
								value={token}
								onChange={(e) => setToken(e.target.value)}
                                className="text-sm py-4 font-bold tracking-widest text-center border focus-visible:ring-[#03A559] focus-visible:border-[#03A559]"
                                placeholder="MASUKKAN TOKEN"
							/>
						</div>
					)}

                    <div className="pt-2">
					    <label className="flex items-center gap-2.5 cursor-pointer group">
						    <input
							    type="checkbox"
							    checked={agree}
							    onChange={(e) => setAgree(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 accent-[#03A559] text-[#03A559] focus:ring-[#03A559] transition-all cursor-pointer"
						    />
                            <div className="flex flex-col">
						        <span className="text-sm font-bold text-gray-800 group-hover:text-[#03A559] transition-colors leading-none">Saya bersedia mengikuti ujian dengan jujur.</span>
                            </div>
					    </label>
                    </div>

					<Button
						className="w-full text-base h-11 font-bold shadow-md transition-all hover:scale-[1.01] bg-[#03A559] hover:bg-[#028A4A] text-white rounded-lg"
						onClick={mulai}
						disabled={!examAllowed}
					>
						{sesiSelesai ? (
							<span className="flex items-center justify-center gap-2">
								<RefreshCw className="w-5 h-5" /> Kerjakan Ulang
							</span>
						) : sesiAktif ? (
							<span className="flex items-center justify-center gap-2">
								Lanjutkan Ujian
							</span>
						) : (
							"Mulai Ujian Sekarang"
						)}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}

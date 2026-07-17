import { createFileRoute, Link } from "@tanstack/react-router";
<<<<<<< HEAD
import { CalendarClock, CalendarX, Clock, FileText } from "lucide-react";
=======
import { useAuthStore } from "@/lib/cbt/auth-store";
import { ujianRepo, sesiRepo, mataKuliahRepo, semesterRepo } from "@/lib/cbt/repos";
import { isParticipantAssignedToExam } from "@/lib/cbt/access";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileText, CalendarClock, CalendarX, ArrowRight, BookOpen } from "lucide-react";
import { getExamAvailabilityStatus } from "@/lib/cbt/availability";
>>>>>>> 6ee9fb29b4f15150ac2f9281c0a7b10e952c358f
import { RichView } from "@/components/cbt/RichEditor";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { isParticipantAssignedToExam } from "@/lib/cbt/access";
import { useAuthStore } from "@/lib/cbt/auth-store";
import { getExamAvailabilityStatus } from "@/lib/cbt/availability";
import { sesiRepo, ujianRepo } from "@/lib/cbt/repos";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/peserta/")({
	component: PesertaDashboard,
});

function PesertaDashboard() {
	const user = useAuthStore((s) => s.user)!;
	
	const [currentPage, setCurrentPage] = useState(1);
	const ITEMS_PER_PAGE = 1;

<<<<<<< HEAD
	const sortedUjian = useMemo(() => {
		const raw = ujianRepo.all().filter((u) => isParticipantAssignedToExam(user, u));
		const sesi = sesiRepo.all().filter((s) => s.pesertaId === user.id);

		return raw.sort((a, b) => {
			const sA = sesi.find((x) => x.ujianId === a.id)?.status ?? "belum";
			const sB = sesi.find((x) => x.ujianId === b.id)?.status ?? "belum";
			
			const availA = getExamAvailabilityStatus(a);
			const availB = getExamAvailabilityStatus(b);

			function getScore(u: typeof a, status: string, avail: string) {
				if (status === "selesai") return 1;
				if (status === "sedang") return 5;
				if (avail === "active" || avail === "open") return 4;
				if (avail === "upcoming") return 3;
				return 2;
			}

			const scoreA = getScore(a, sA, availA);
			const scoreB = getScore(b, sB, availB);

			if (scoreA !== scoreB) return scoreB - scoreA;

			const timeA = Number(a.beginAt || 0);
			const timeB = Number(b.beginAt || 0);
			
			if (scoreA === 3) {
				return timeA - timeB;
			}
			return timeB - timeA;
		});
	}, [user]);

	const totalPages = Math.ceil(sortedUjian.length / ITEMS_PER_PAGE);
	const currentData = sortedUjian.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);
	
	const sesi = sesiRepo.all().filter((s) => s.pesertaId === user.id);

	return (
		<div className="w-full flex-1 flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0 px-6 md:px-10 pt-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-gray-800">
						Halo, <span className="text-[#03A559]">{user.namaLengkap}</span>
					</h1>
					<p className="text-muted-foreground mt-1 text-sm md:text-base">
						Berikut adalah daftar ujian yang tersedia untuk Anda.
					</p>
				</div>
			</div>

			{sortedUjian.length === 0 ? (
                <div className="w-full flex-1 flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
                    <CalendarX className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-500">Belum ada ujian yang diberikan untuk Anda.</p>
                </div>
            ) : (
                <div className="w-full flex-1 flex flex-col relative bg-white">
					{currentData.map((u) => {
						const s = sesi.find((x) => x.ujianId === u.id);
						const status = s?.status ?? "belum";
						const selesai = status === "selesai";
						const availability = getExamAvailabilityStatus(u);
						const isStartable = availability === "active" || availability === "open";
                        
                        const isDitutup = availability === "ended" && !selesai;

                        const badgeColor = 
                            selesai ? "bg-green-100 text-green-700 border-green-200" :
                            isDitutup ? "bg-red-100 text-red-700 border-red-200" :
                            "bg-blue-100 text-blue-700 border-blue-200";

						return (
							<div key={u.id} className="flex-1 flex flex-col md:flex-row w-full h-full relative">
                                <div className={cn("absolute top-0 left-0 w-2 h-full z-10", 
                                    selesai ? "bg-[#03A559]" :
                                    isDitutup ? "bg-red-500" :
                                    "bg-blue-500"
                                )}></div>
                                    
                                {/* Kiri: Info & Deskripsi */}
                                <div className="flex-1 flex flex-col justify-center p-10 md:p-20 pl-12 md:pl-24 bg-white">
                                    <div className="max-w-3xl">
									    <div className="flex items-start gap-5 mb-6">
										    <div className={cn("p-4 rounded-2xl shadow-sm shrink-0", 
                                                isStartable && !selesai ? "bg-[#03A559]/10 text-[#03A559]" : "bg-gray-100 text-gray-500"
                                            )}>
                                                <FileText className="h-8 w-8" />
                                            </div>
                                            <div className="flex-1 pt-1">
										        <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">{u.nama}</h3>
                                                <div className="flex items-center gap-6 text-base font-semibold text-gray-500 mb-8">
                                                    <span className="flex items-center gap-2">
										                <Clock className="h-5 w-5" /> {u.durasiMenit} menit
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-gray-300"></div> {u.topicSets.reduce((a, b) => a + b.jumlah, 0)} soal
                                                    </span>
                                                </div>
                                                
                                                <div className="prose prose-lg text-gray-600 leading-relaxed mb-8">
                                                    <RichView html={u.deskripsi || "Tidak ada deskripsi."} />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    {availability === "upcoming" && (
                                                        <div className="inline-flex items-center self-start gap-2 rounded-md border border-yellow-200 bg-yellow-50/50 py-2 px-3 text-xs text-yellow-800 font-medium shadow-sm">
                                                            <CalendarClock className="h-4 w-4 shrink-0 text-yellow-600" />
                                                            <span>Dibuka: {u.beginAt ? new Date(Number(u.beginAt)).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" }) : "Menunggu jadwal"}</span>
                                                        </div>
                                                    )}
                                                    {availability === "ended" && !selesai && (
                                                        <div className="inline-flex items-center self-start gap-2 rounded-md border border-red-200 bg-red-50/50 py-2 px-3 text-xs text-red-800 font-medium shadow-sm">
                                                            <CalendarX className="h-4 w-4 shrink-0 text-red-600" />
                                                            <span>Ditutup: {u.endAt ? new Date(Number(u.endAt)).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" }) : ""}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
									    </div>
                                    </div>
                                </div>

                                {/* Kanan: Aksi & Status */}
                                <div className="flex flex-col items-center justify-center p-10 md:p-16 w-full md:w-[400px] lg:w-[500px] bg-gray-50/80 border-t md:border-t-0 md:border-l border-gray-200 shrink-0 gap-8 shadow-inner">
									<span className={cn("rounded-full px-6 py-2.5 text-sm font-extrabold border uppercase tracking-widest shadow-sm", badgeColor)}>
										{selesai ? "SELESAI" : 
                                            isDitutup ? "DITUTUP" : "BELUM DIKERJAKAN"}
									</span>
									
                                    <div className="w-full">
                                        {selesai ? (
                                            <Button asChild size="lg" variant="outline" className="w-full h-16 rounded-xl font-bold border-2 border-[#03A559] text-[#03A559] hover:bg-green-50 text-xl transition-all hover:scale-[1.02]">
                                                <Link to="/peserta/ujian/$id/hasil" params={{ id: u.id }}>
                                                    Lihat Hasil
                                                </Link>
                                            </Button>
                                        ) : isStartable ? (
                                            <Button asChild size="lg" className="w-full h-16 rounded-xl font-bold text-white shadow-xl transition-all text-xl bg-[#03A559] hover:bg-[#028A4A] hover:scale-[1.02] hover:shadow-2xl">
                                                <Link to="/peserta/ujian/$id" params={{ id: u.id }}>
                                                    {status === "sedang" ? "Lanjutkan" : "Mulai Ujian"}
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button size="lg" variant="secondary" disabled className="w-full h-16 rounded-xl font-bold opacity-70 text-xl">
                                                {availability === "upcoming" ? "Terkunci" : "Ditutup"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
							</div>
						);
					})}
                    
                    {/* Floating Pagination Bottom Center */}
                    {totalPages > 1 && (
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-3 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-gray-100">
                            {Array.from({ length: totalPages }).map((_, i) => {
                                const pageNum = i + 1;
                                const isActive = currentPage === pageNum;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={cn(
                                            "w-14 h-14 flex items-center justify-center font-bold text-lg rounded-lg border-2 transition-all shadow-sm",
                                            isActive 
                                                ? "border-[#03A559] text-white bg-[#03A559] scale-110 shadow-md" 
                                                : "border-gray-200 bg-white text-gray-700 hover:border-[#03A559]/50 hover:bg-[#03A559]/10"
                                        )}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
			)}
		</div>
	);
=======
  return (
    <div className="space-y-8 pb-10">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/90 to-primary p-8 text-primary-foreground shadow-md">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Halo, {user.namaLengkap}</h1>
          <p className="max-w-xl text-primary-foreground/80">
            Selamat datang di portal ujian Anda. Kerjakan ujian dengan jujur dan teliti. 
            Semoga mendapatkan hasil yang terbaik.
          </p>
        </div>
        <div className="absolute -right-10 -top-10 z-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 right-20 z-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Daftar Ujian Anda</h2>


      {ujian.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Belum ada ujian yang diberikan untuk Anda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ujian.map((u) => {
            const s = sesi.find((x) => x.ujianId === u.id);
            const status = s?.status ?? "belum";
            const selesai = status === "selesai";
            const availability = getExamAvailabilityStatus(u);
            const isStartable = availability === "active" || availability === "open";
            const mk = u.mataKuliahId ? mataKuliahRepo.byId(u.mataKuliahId) : null;
            const smt = u.semesterId ? semesterRepo.byId(u.semesterId) : null;
            return (
              <Card key={u.id} className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="flex items-start gap-2 text-lg leading-tight">
                      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      {u.nama}
                    </CardTitle>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {status === "belum" ? "Belum" : status === "sedang" ? "Sedang" : "Selesai"}
                    </span>
                  </div>
                  {mk && (
                    <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      {mk.nama} {smt ? `· ${smt.nama}` : ""}
                    </div>
                  )}
                  <CardDescription className="flex items-center gap-3 text-xs mt-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {u.durasiMenit} menit
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> {u.topicSets.reduce((a, b) => a + b.jumlah, 0)} soal
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <RichView
                    className="text-sm text-muted-foreground line-clamp-3"
                    html={u.deskripsi}
                  />
                  {availability === "upcoming" && (
                    <div className="flex items-start gap-2 rounded border border-info/30 bg-info/10 p-2 text-xs">
                      <CalendarClock className="h-4 w-4 shrink-0 text-info-foreground" />
                      <span>
                        Dibuka {u.beginAt ? new Date(u.beginAt).toLocaleString("id-ID") : ""}
                      </span>
                    </div>
                  )}
                  {availability === "ended" && (
                    <div className="flex items-start gap-2 rounded border border-destructive/30 bg-destructive/10 p-2 text-xs">
                      <CalendarX className="h-4 w-4 shrink-0 text-destructive" />
                      <span>
                        Ditutup {u.endAt ? new Date(u.endAt).toLocaleString("id-ID") : ""}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-end pt-2">
                    {selesai ? (
                      <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                        <Link to="/peserta/ujian/$id/hasil" params={{ id: u.id }}>
                          Lihat Hasil
                        </Link>
                      </Button>
                    ) : isStartable ? (
                      <Button asChild size="sm" className="w-full sm:w-auto group-hover:bg-primary/90 transition-colors">
                        <Link to="/peserta/ujian/$id" params={{ id: u.id }}>
                          {status === "sedang" ? "Lanjutkan Ujian" : "Mulai Ujian"}
                          <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="w-full sm:w-auto">
                        {availability === "upcoming" ? "Belum Dibuka" : "Sudah Berakhir"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
>>>>>>> 6ee9fb29b4f15150ac2f9281c0a7b10e952c358f
}

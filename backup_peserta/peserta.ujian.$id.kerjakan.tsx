import { useAuthStore } from "@/lib/cbt/auth-store";
import { soalRepo, sesiRepo, ujianRepo, invalidateReposCache } from "@/lib/cbt/repos";
import type { SesiUjian, Ujian } from "@/lib/cbt/types";
import { cn } from "@/lib/utils";
<<<<<<< HEAD
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutGrid, X } from "lucide-react";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AudioPlayer } from "@/components/cbt/AudioPlayer";
import { RichView } from "@/components/cbt/RichEditor";
=======
import { Flag, Clock, AlertTriangle, Save, Loader2, CheckCircle2 } from "lucide-react";
>>>>>>> 6ee9fb29b4f15150ac2f9281c0a7b10e952c358f

export const Route = createFileRoute(
  "/_authenticated/peserta/ujian/$id/kerjakan",
)({
  component: RouteComponent,
  loader: async () => {
    invalidateReposCache();
    return null;
  },
});

<<<<<<< HEAD
function gradeSesi(sesi: SesiUjian, ujian: Ujian) {
  const currentSesi = JSON.parse(JSON.stringify(sesi)) as SesiUjian;
  let score = 0;
  for (let i = 0; i < currentSesi.soalIds.length; i++) {
    const soalId = currentSesi.soalIds[i];
    const soal = soalRepo.byId(soalId);
    const j = currentSesi.jawaban[i];
    if (!soal || !j) continue;
=======
function Kerjakan() {
  const { id } = useParams({ from: "/_authenticated/peserta/ujian/$id/kerjakan" });
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const ujian = ujianRepo.byId(id);
  const initSesi = useMemo(
    () =>
      user
        ? sesiRepo
            .all()
            .find((s) => s.ujianId === id && s.pesertaId === user.id && s.status === "sedang")
        : undefined,
    [id, user],
  );
  const [sesi, setSesi] = useState<SesiUjian | null>(initSesi ?? null);
  const [idx, setIdx] = useState(0);
  const [cheatWarning, setCheatWarning] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const submittingRef = useRef(false);
  const sesiRef = useRef<SesiUjian | null>(initSesi ?? null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
>>>>>>> 6ee9fb29b4f15150ac2f9281c0a7b10e952c358f

    if (soal.tipe === "multi") {
      const correctIds = soal.jawaban.filter((x) => x.benar).map((x) => x.id);
      const isCorrect =
        j.jawabanIds.length === correctIds.length &&
        j.jawabanIds.every((id) => correctIds.includes(id));
      if (isCorrect) score += ujian.poinBenar;
    } else {
      const correctOpt = soal.jawaban.find((x) => x.benar);
      if (correctOpt && j.jawabanIds.includes(correctOpt.id)) {
        score += ujian.poinBenar;
      }
    }
  }
  currentSesi.status = "selesai";
  currentSesi.skorTotal = score;
  currentSesi.selesaiAt = Date.now();
  
  if (currentSesi.mulaiAt) {
    const maxDur = ujian.durasiMenit || 60;
    const start = currentSesi.mulaiAt;
    const now = Date.now();
    const elapsedMinutes = (now - start) / 60000;
    if (elapsedMinutes > maxDur + 5) {
      currentSesi.selesaiAt = start + maxDur * 60000;
    }
  }

  return currentSesi;
}

function RouteComponent() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const ujian = ujianRepo.all().find((u) => u.id === id);

  const [sesiDicari, setSesiDicari] = useState(false);
  const [sesi, setSesi] = useState<SesiUjian | null>(null);

  const [idx, setIdx] = useState(0);
  const [now, setNow] = useState(Date.now());
  const submittingRef = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  const [showList, setShowList] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg">("base");

  useEffect(() => {
    if (!user || !ujian) return;
    const active = sesiRepo.all().find(
      (x) => x.ujianId === ujian.id && x.pesertaId === user.id && x.status === "sedang"
    );
    setSesi(active || null);
    setSesiDicari(true);
  }, [user, ujian]);

  useEffect(() => {
    if (sesi && sesi.status === "selesai") {
      navigate({
        to: "/peserta/ujian/$id/hasil",
        params: { id: sesi.ujianId },
      });
    }
  }, [sesi, navigate]);

  const endsAt = useMemo(() => {
    if (!sesi || !ujian) return 0;
    if (sesi.endsAt) return sesi.endsAt;
    const start = sesi.mulaiAt || Date.now();
    return start + (ujian.durasiMenit || 60) * 60 * 1000;
  }, [sesi, ujian]);

  const remaining = Math.max(0, endsAt - now);

  const sesiRef = useRef(sesi);
  useEffect(() => {
    sesiRef.current = sesi;
  }, [sesi]);

<<<<<<< HEAD
  useEffect(() => {
    if (!sesi || !ujian || sesi.status === "selesai") return;
    const interval = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= endsAt) {
        clearInterval(interval);
        submit("Waktu Habis");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sesi, ujian, endsAt]);

  function updateJawaban(partial: Partial<SesiUjian["jawaban"][0]>) {
    if (!sesi) return;
    const nextSesi = { ...sesi };
    nextSesi.jawaban = [...nextSesi.jawaban];
    nextSesi.jawaban[idx] = { ...nextSesi.jawaban[idx], ...partial };
    setSesi(nextSesi);

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      sesiRepo.upsert(nextSesi);
      sesiRepo.flush();
    }, 2000);
=======
  // Debounced persist: tulis sesi ke server setelah jeda, coalesce tulisan cepat.
  function persistSesi(next: SesiUjian, delay = 500) {
    if (submittingRef.current) return;
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      if (!submittingRef.current) {
        sesiRepo.upsert(next);
        setSaveStatus("saved");
      }
    }, delay);
>>>>>>> 6ee9fb29b4f15150ac2f9281c0a7b10e952c358f
  }

  function toggleOption(jawabanId: string) {
    if (!sesi || !soal) return;
    const currentJawaban = sesi.jawaban[idx];
    const currentSoal = soal;
    let nextJawabanIds = [...currentJawaban.jawabanIds];

    if (currentSoal.tipe === "multi") {
      const has = currentJawaban.jawabanIds.includes(jawabanId);
      nextJawabanIds = has
        ? currentJawaban.jawabanIds.filter((x) => x !== jawabanId)
        : [...currentJawaban.jawabanIds, jawabanId];
    } else {
      nextJawabanIds = [jawabanId];
    }

    updateJawaban({ jawabanIds: nextJawabanIds });
  }

  function handleNavigateIdx(newIdx: number) {
    if (!sesi) return;
    const currentJawaban = sesi.jawaban[idx];
    
    if (newIdx !== idx) {
      const dijawab = currentJawaban.jawabanIds.length > 0 || currentJawaban.jawabanEssay.trim().length > 0;
      if (!dijawab) {
        toast.error("Anda harus memilih/mengisi jawaban sebelum pindah ke soal lain!");
        return;
      }
    }
    
    setIdx(newIdx);
  }

  async function submit(reason?: string) {
    if (submittingRef.current || !ujian || !sesiRef.current) return;
    submittingRef.current = true;
    try {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
<<<<<<< HEAD
      const graded = gradeSesi(sesiRef.current, ujian);
      sesiRepo.upsert(graded);
      const result = await sesiRepo.flush();
      if (!result.ok) {
        toast.error("Gagal menyimpan jawaban. Coba kumpulkan lagi.");
        submittingRef.current = false;
        return;
=======
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  // Timer
  useEffect(() => {
    if (!sesi?.endsAt) return;
    const tick = () => {
      const r = Math.max(0, (sesi.endsAt as number) - Date.now());
      setRemaining(r);
      if (r === 0 && !submittingRef.current) void submit("waktu habis");
    };
    tick();
    const t = window.setInterval(tick, 500);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesi?.endsAt]);

  // Anti-cheat
  useEffect(() => {
    if (!ujian) return;
    function onVisibility() {
      if (document.visibilityState === "hidden" && sesiRef.current) {
        const next = { ...sesiRef.current, pelanggaran: sesiRef.current.pelanggaran + 1 };
        setSesi(next);
        persistSesi(next);
        setCheatWarning(next.pelanggaran);
        if (next.pelanggaran > 0 && !submittingRef.current) {
          const activeUjian = ujianRepo.byId(id);
          if (
            activeUjian &&
            activeUjian.maxPindahTab > 0 &&
            next.pelanggaran > activeUjian.maxPindahTab
          ) {
            void submit("terlalu sering pindah tab");
          }
        }
>>>>>>> 6ee9fb29b4f15150ac2f9281c0a7b10e952c358f
      }
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      toast.success(
        reason ? `Ujian disubmit (${reason})` : "Ujian berhasil disubmit",
      );
      navigate({
        to: "/peserta/ujian/$id/hasil",
        params: { id: ujian.id },
      });
    } catch {
      toast.error("Gagal menyimpan jawaban. Coba kumpulkan lagi.");
      submittingRef.current = false;
    }
  }

  if (!user) {
    return <div className="p-6">Anda harus login terlebih dahulu.</div>;
  }

  if (!ujian) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md text-center space-y-4">
          <h2 className="text-xl font-bold">Data Ujian Tidak Ditemukan</h2>
          <Button onClick={() => (window.location.href = "/peserta")}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  if (!sesiDicari) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">Memuat ujian…</p>
        </div>
      </div>
    );
  }

  if (!sesi) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md text-center space-y-4">
          <h2 className="text-xl font-bold">Sesi Tidak Ditemukan</h2>
          <Button onClick={() => (window.location.href = "/peserta")}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  const soalId = sesi.soalIds[idx];
  const soal = soalId ? soalRepo.byId(soalId) : undefined;
  const j = sesi.jawaban[idx];

  if (!soal || !j) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md text-center space-y-4">
          <h2 className="text-xl font-bold">Soal Belum Siap</h2>
          <Button onClick={() => (window.location.href = "/peserta")}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  const currentUser = user;
  const currentSesi = sesi;
  const currentSoal = soal;
  const currentJawaban = j;
  const optOrder =
    currentSesi.jawabanOrder[currentSoal.id] ??
    currentSoal.jawaban.map((o) => o.id);

  const mm = Math.floor(remaining / 60000);
  const ss = Math.floor((remaining % 60000) / 1000);
  const danger = remaining < 60_000;

  const textSizeClass = 
    fontSize === "sm" ? "text-sm" : 
    fontSize === "lg" ? "text-xl" : "text-base";

  return (
<<<<<<< HEAD
    <div className="flex flex-col h-full bg-[#eaeff2] font-sans">
      {/* Header handled by global layout */}

      {/* Main Area */}
      <div className="flex-1 flex flex-col md:flex-row mx-auto w-full max-w-6xl gap-0 md:gap-4 relative p-0 md:p-4 h-full min-h-0">
        {/* Left panel: soal + jawaban */}
        <div className="flex-1 flex flex-col bg-white shadow-lg md:rounded-lg min-h-0">
          {/* Info Bar */}
          <div className="flex flex-wrap items-center justify-between p-3 md:p-4 border-b bg-gray-50 text-sm md:text-base">
            <div className="flex items-center font-bold text-gray-700">
              <span className="hidden sm:inline mr-2">SOAL NOMOR</span>
              <span className="sm:hidden mr-2">NO.</span>
              <div className="bg-[#03A559] text-white px-3 py-1 rounded-md text-lg min-w-10 text-center">
                {idx + 1}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2 sm:mt-0">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 hidden sm:inline">Ukuran:</span>
                <div className="flex bg-white border rounded shadow-sm overflow-hidden">
                  <button onClick={() => setFontSize("sm")} className={cn("px-2 py-1 font-bold", fontSize === "sm" && "bg-gray-200 text-[#03A559]")}>A-</button>
                  <button onClick={() => setFontSize("base")} className={cn("px-2 py-1 text-lg font-bold border-l border-r", fontSize === "base" && "bg-gray-200 text-[#03A559]")}>A</button>
                  <button onClick={() => setFontSize("lg")} className={cn("px-2 py-1 text-xl font-bold", fontSize === "lg" && "bg-gray-200 text-[#03A559]")}>A+</button>
                </div>
              </div>
              
              <div className={cn("flex items-center gap-2 rounded-full px-4 py-1 font-bold tabular-nums shadow-inner", danger ? "bg-red-100 text-red-600 border border-red-200" : "bg-gray-100 text-gray-700 border")}>
                Sisa Waktu: {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
              </div>

              <Button 
                className="bg-[#03A559] hover:bg-[#027A41] text-white md:hidden flex items-center gap-2"
                onClick={() => setShowList(true)}
              >
                <LayoutGrid className="w-4 h-4" /> Daftar Soal
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className={cn("flex-1 overflow-y-auto p-5 md:p-8", textSizeClass)}>
            <RichView html={currentSoal.detail} className="prose max-w-none" />
            
            {currentSoal.audioFileId && (
              <div className="my-6">
                <AudioPlayer
                  fileId={currentSoal.audioFileId}
                  playOnce={currentSoal.audioPlayOnce}
                  storageKey={`cbtman:audio:${currentSesi.id}:${currentSoal.id}`}
                />
              </div>
            )}

            <div className="mt-8">
              {currentSoal.tipe === "essay" ? (
                <Textarea
                  rows={8}
                  value={currentJawaban.jawabanEssay}
                  onChange={(e) => updateJawaban({ jawabanEssay: e.target.value })}
                  placeholder="Ketik jawaban Anda di sini..."
                  className="text-lg p-4 border-gray-300 focus-visible:ring-[#03A559]"
                />
              ) : (
                <div className="space-y-4">
                  {optOrder.map((oid, i) => {
                    const opt = currentSoal.jawaban.find((x) => x.id === oid);
                    if (!opt) return null;
                    const checked = currentJawaban.jawabanIds.includes(oid);
                    const optLabel = String.fromCharCode(65 + i);
                    return (
                      <div 
                        key={oid}
                        onClick={() => toggleOption(oid)}
                        className={cn(
                          "flex w-full items-start gap-4 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 group",
                          checked ? "border-[#03A559] bg-[#03A559]/5 shadow-sm" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        <div className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-bold transition-colors mt-0.5",
                          checked 
                            ? "border-[#03A559] bg-[#03A559] text-white" 
                            : "border-gray-400 text-gray-500 group-hover:border-gray-500"
                        )}>
                          {optLabel}
                        </div>
                        <div className="flex-1 mt-1">
                          <RichView html={opt.detail} className="prose max-w-none prose-p:my-0" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="border-t bg-gray-50 p-4 shrink-0 flex flex-wrap gap-3 items-center justify-between">
            <Button
              variant="outline"
              className="border-gray-300 font-bold px-6 py-6"
              disabled={idx === 0}
              onClick={() => handleNavigateIdx(idx - 1)}
            >
              &lsaquo; SOAL SEBELUMNYA
            </Button>

            <label className={cn(
              "flex items-center gap-2 cursor-pointer px-8 py-3 rounded-md font-bold text-white transition-all shadow-sm",
              currentJawaban.ragu ? "bg-yellow-500 hover:bg-yellow-600" : "bg-yellow-400 hover:bg-yellow-500"
            )}>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-[#03A559] rounded"
                checked={currentJawaban.ragu}
                onChange={(e) => updateJawaban({ ragu: e.target.checked })}
              />
              RAGU - RAGU
            </label>

            {idx < currentSesi.soalIds.length - 1 ? (
              <Button
                className="bg-[#03A559] hover:bg-[#027A41] text-white font-bold px-6 py-6"
                onClick={() => handleNavigateIdx(idx + 1)}
              >
                SOAL SELANJUTNYA &rsaquo;
              </Button>
            ) : (
              <Button
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-6"
                onClick={() => {
                  if (confirm("Apakah Anda yakin ingin mengumpulkan ujian ini?")) void submit();
                }}
              >
                KUMPULKAN UJIAN
              </Button>
            )}

            <Button 
              className="bg-[#03A559] hover:bg-[#027A41] text-white flex md:hidden w-full items-center justify-center mt-2 py-6"
              onClick={() => setShowList(true)}
            >
              <LayoutGrid className="w-5 h-5 mr-2" /> DAFTAR SOAL
            </Button>
=======
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
          <div className="text-sm">
            <div className="font-bold text-base tracking-tight">{currentUjian.nama}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="font-medium">{currentUser.namaLengkap}</span>
              <span>·</span>
              <span>Soal {idx + 1} / {currentSesi.soalIds.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
              {saveStatus === "saving" ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyimpan...</>
              ) : saveStatus === "error" ? (
                <><AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Gagal simpan</>
              ) : (
                <><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Tersimpan</>
              )}
            </div>
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-lg font-bold tabular-nums shadow-sm transition-colors",
                danger
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : "bg-primary text-primary-foreground",
              )}
            >
              <Clock className="h-5 w-5" />
              {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
            </div>
>>>>>>> 6ee9fb29b4f15150ac2f9281c0a7b10e952c358f
          </div>
        </div>

<<<<<<< HEAD
        {/* Right sidebar: navigasi soal (hidden on mobile, visible md+) */}
        <div className="hidden md:flex flex-col w-64 bg-white shadow-lg rounded-lg p-4 shrink-0 min-h-0">
          <h3 className="font-bold text-gray-700 mb-3 text-sm">DAFTAR SOAL</h3>
          <div className="flex flex-wrap gap-3 mb-4 text-xs font-medium bg-gray-50 p-2 rounded border">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-[#03A559] rounded border border-[#027A41]"></div>
              <span>Sudah</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-400 rounded border border-yellow-500"></div>
              <span>Ragu</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-white rounded border border-gray-300"></div>
              <span>Kosong</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 overflow-y-auto p-1">
            {currentSesi.soalIds.map((_, i) => {
              const a = currentSesi.jawaban[i];
              const dijawab = a.jawabanIds.length > 0 || a.jawabanEssay.length > 0;
              return (
                <button
                  key={i}
                  onClick={() => handleNavigateIdx(i)}
                  className={cn(
                    "aspect-square rounded-lg text-sm font-bold border-2 transition-all hover:scale-105",
                    i === idx && "ring-2 ring-[#03A559] ring-offset-1",
                    a.ragu
                      ? "bg-yellow-400 text-white border-yellow-500"
                      : dijawab
                        ? "bg-[#03A559] text-white border-[#027A41]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-auto pt-4 border-t">
            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm"
              onClick={() => { if (confirm("Kumpulkan sekarang?")) void submit(); }}
            >
              Kumpulkan Sekarang
            </Button>
          </div>
        </div>
      </div>
=======
      <div className="container mx-auto grid gap-6 p-4 lg:grid-cols-[1fr_300px] mt-4">
        <Card className="shadow-md border-0 ring-1 ring-border/50">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="text-sm font-medium text-primary/80 bg-primary/10 w-fit px-3 py-1 rounded-full">
              Soal #{idx + 1}
            </div>
            <div className="prose prose-sm sm:prose-base max-w-none">
              <RichView html={currentSoal.detail} />
            </div>
            {currentSoal.audioFileId && (
              <AudioPlayer
                fileId={currentSoal.audioFileId}
                playOnce={currentSoal.audioPlayOnce}
                storageKey={`cbtman:audio:${currentSesi.id}:${currentSoal.id}`}
              />
            )}
>>>>>>> 6ee9fb29b4f15150ac2f9281c0a7b10e952c358f

      {/* Daftar Soal Fullscreen Modal */}
      {showList && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden animate-in fade-in duration-200">
          <div className="flex justify-between items-center bg-[#03A559] text-white p-4 shadow-md">
            <div className="flex items-center gap-2 text-xl font-bold">
              <LayoutGrid className="w-6 h-6" /> Daftar Soal
            </div>
            <button 
              className="p-2 bg-[#028A4A] hover:bg-[#027A41] rounded-full transition-colors"
              onClick={() => setShowList(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-wrap gap-4 mb-8 text-sm font-bold bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#03A559] rounded border border-[#027A41]"></div>
                  Sudah Dijawab
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-yellow-400 rounded border border-yellow-500"></div>
                  Ragu-Ragu
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white rounded border border-gray-300"></div>
                  Belum Dijawab
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {currentSesi.soalIds.map((_, i) => {
                  const a = currentSesi.jawaban[i];
                  const dijawab = a.jawabanIds.length > 0 || a.jawabanEssay.length > 0;
                  return (
                    <button
                      key={i}
                      onClick={() => { handleNavigateIdx(i); setShowList(false); }}
                      className={cn(
                        "aspect-square rounded-lg text-lg md:text-xl font-bold border-2 transition-all shadow-sm hover:scale-105",
                        i === idx && "ring-4 ring-black ring-offset-2",
                        a.ragu
                          ? "bg-yellow-400 text-white border-yellow-500"
                          : dijawab
                            ? "bg-[#03A559] text-white border-[#027A41]"
                            : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      )}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-12 flex justify-center">
                <Button 
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-12 py-6 text-lg"
                  onClick={() => {
                    setShowList(false);
                    if (confirm("Kumpulkan sekarang?")) void submit();
                  }}
                >
                  Kumpulkan Sekarang
                </Button>
              </div>
            </div>
<<<<<<< HEAD
=======
          </CardContent>
        </Card>

        <Card className="shadow-sm h-fit sticky top-24">
          <CardContent className="p-5 space-y-5">
            <div>
              <h3 className="font-semibold text-lg mb-3">Navigasi Soal</h3>
              <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2">
                {currentSesi.soalIds.map((_, i) => {
                  const a = currentSesi.jawaban[i];
                  const dijawab = a.jawabanIds.length > 0 || a.jawabanEssay.length > 0;
                  return (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      className={cn(
                        "h-9 rounded text-xs font-medium border transition",
                        i === idx && "ring-2 ring-primary",
                        a.ragu
                          ? "bg-warning/20 border-warning/40"
                          : dijawab
                            ? "bg-success/20 border-success/40"
                            : "bg-muted",
                      )}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                <span className="inline-block h-3 w-3 rounded bg-success/30 mr-1" />
                Dijawab
              </div>
              <div>
                <span className="inline-block h-3 w-3 rounded bg-warning/30 mr-1" />
                Ragu-ragu
              </div>
              <div>
                <span className="inline-block h-3 w-3 rounded bg-muted mr-1 border" />
                Belum
              </div>
            </div>
            {currentSesi.pelanggaran > 0 && (
              <div className="rounded bg-destructive/10 p-2 text-xs text-destructive">
                ⚠ {currentSesi.pelanggaran}× pindah tab terdeteksi (max {currentUjian.maxPindahTab})
              </div>
            )}
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => {
                if (confirm("Kumpulkan sekarang?")) void submit();
              }}
            >
              Kumpulkan Sekarang
            </Button>
          </CardContent>
        </Card>
      </div>

      {cheatWarning > 0 && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-red-950/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl max-w-md w-full shadow-2xl text-center border-4 border-red-500 animate-in zoom-in-95 duration-300">
            <AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-6 animate-bounce" />
            <h2 className="text-3xl font-extrabold text-red-600 dark:text-red-400 mb-3 tracking-tight">
              PELANGGARAN TATA TERTIB!
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-8 text-lg leading-relaxed font-medium">
              Sistem mendeteksi Anda keluar dari halaman ujian atau berpindah tab/aplikasi. 
              <br/><br/>
              <span className="font-bold text-red-600">Ini adalah pelanggaran ke-{cheatWarning}.</span> 
              <br/>
              Ujian akan dihentikan otomatis dan mendapat nilai 0 jika Anda terus melanggar.
            </p>
            <Button 
              variant="destructive" 
              className="w-full font-bold text-lg h-14 shadow-lg hover:bg-red-600"
              onClick={() => setCheatWarning(0)}
            >
              SAYA MENGERTI, KEMBALI KE UJIAN
            </Button>
>>>>>>> 6ee9fb29b4f15150ac2f9281c0a7b10e952c358f
          </div>
        </div>
      )}
    </div>
  );
}

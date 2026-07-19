import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { sesiRepo, ujianRepo, soalRepo, usersRepo, hydrateRepos } from "@/lib/cbt/repos";
import { useAuthStore } from "@/lib/cbt/auth-store";
import { recomputeSkor } from "@/lib/cbt/exam";
import { RichView } from "@/components/cbt/RichEditor";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, AlertCircle, Save, FileSignature, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/evaluasi/$id")({
  loader: async () => {
    try {
      await hydrateRepos();
    } catch {
      // Fallback
    }
  },
  component: EvaluasiSesi,
});

function EvaluasiSesi() {
  const { id } = useParams({ from: "/_authenticated/admin/evaluasi/$id" });
  const me = useAuthStore((s) => s.user);
  const [sesi, setSesi] = useState(sesiRepo.byId(id));
  
  if (!me) return <div className="p-8 text-center font-bold text-slate-500">Akses Ditolak</div>;
  if (!sesi) return <div className="p-8 text-center font-bold text-slate-500">Sesi tidak ditemukan</div>;
  
  const ujian = ujianRepo.byId(sesi.ujianId);
  if (!ujian) return <div className="p-8 text-center font-bold text-slate-500">Ujian tidak ditemukan</div>;
  
  const peserta = usersRepo.byId(sesi.pesertaId);
  const items = sesi.jawaban
    .map((j, idx) => ({ j, idx, soal: soalRepo.byId(j.soalId) }))
    .filter((x) => x.soal?.tipe === "essay" || x.j.jawabanEssay.trim().length > 0);

  const totalUngraded = items.filter(x => typeof x.j.skor !== 'number').length;

  function normalizeSkor(skor: number | undefined): number | undefined {
    if (skor === undefined || !Number.isFinite(skor)) return undefined;
    return Math.max(0, Math.min(ujian!.poinBenar, skor));
  }

  function setSkor(idx: number, skor: number | undefined, catatan: string) {
    if (!sesi) return;
    const next = {
      ...sesi,
      jawaban: sesi.jawaban.map((x, i) =>
        i === idx ? { ...x, skor: normalizeSkor(skor), catatanGrader: catatan } : x,
      ),
    };
    sesiRepo.upsert(next);
    setSesi(next);
  }

  function selesaikan() {
    if (!sesi) return;
    const final = recomputeSkor(sesi, ujian!);
    const withMeta = { ...final, gradedAt: Date.now(), gradedBy: me!.id };
    sesiRepo.upsert(withMeta);
    setSesi(withMeta);
    toast.success(`Tersimpan. Nilai: ${withMeta.skorTotal} / ${withMeta.maxSkor}`);
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
        <div>
          <Link 
            to="/admin/evaluasi" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Koreksi: {peserta?.namaLengkap || "Anonim"}</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Ujian: {ujian.nama}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Progress:</span>
            <span className="font-semibold text-slate-900 dark:text-zinc-100">
              {items.length - totalUngraded} / {items.length}
            </span>
          </div>
          <button 
            onClick={selesaikan}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            <Save className="h-4 w-4" /> Simpan
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main Panel */}
        <div className="flex-1 space-y-6 w-full">
          {items.map(({ j, idx, soal }) => {
            const isGraded = typeof j.skor === 'number';
            
            if (!soal) return (
              <div key={idx} className="bg-rose-50 border border-rose-200 p-4 rounded-md">
                <AlertTriangle className="h-5 w-5 text-rose-500 mb-2" />
                <p className="text-sm text-rose-700">Soal #{idx + 1} tidak ditemukan.</p>
              </div>
            );

            return (
              <div key={idx} className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Pertanyaan #{idx + 1}</div>
                  {isGraded ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> Dinilai
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertCircle className="h-3 w-3" /> Menunggu
                    </span>
                  )}
                </div>
                
                <div className="p-4 prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-zinc-200 border-b border-slate-100 dark:border-zinc-800/50">
                  <RichView html={soal.detail} />
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-zinc-900/30">
                  <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                    <FileSignature className="h-3.5 w-3.5" /> Jawaban Peserta
                  </div>
                  <div className="text-sm text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 p-3 rounded border border-slate-200 dark:border-zinc-800 whitespace-pre-wrap min-h-[80px]">
                    {j.jawabanEssay ? j.jawabanEssay : <span className="text-slate-400 italic">Kosong</span>}
                  </div>
                </div>

                <div className="p-4 flex flex-col sm:flex-row gap-4 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Nilai:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={ujian.poinBenar}
                        value={j.skor ?? ""}
                        onChange={(e) => setSkor(idx, e.target.value === "" ? undefined : Number(e.target.value), j.catatanGrader ?? "")}
                        placeholder="0"
                        className="w-20 h-9 px-2 text-center text-sm font-semibold bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                      <span className="text-sm text-slate-500">/ {ujian.poinBenar}</span>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 shrink-0">Catatan:</label>
                    <input
                      type="text"
                      value={j.catatanGrader ?? ""}
                      onChange={(e) => setSkor(idx, j.skor, e.target.value)}
                      placeholder="Opsional..."
                      className="w-full h-9 px-3 text-sm bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Side Panel */}
        <div className="w-full lg:w-80 shrink-0 sticky top-8 space-y-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm p-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-4 border-b border-slate-100 dark:border-zinc-800 pb-2">Ringkasan</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Soal</span>
                <span className="font-medium text-slate-900 dark:text-zinc-100">{items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Belum Dinilai</span>
                <span className={`font-medium ${totalUngraded > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{totalUngraded}</span>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-1">Skor Sementara</div>
                <div className="text-4xl font-bold text-slate-900 dark:text-zinc-100 text-center">
                  {sesi.skorTotal ?? 0}
                  <span className="text-base font-normal text-slate-500 ml-1">/ {sesi.maxSkor ?? 0}</span>
                </div>
              </div>
              
              <button 
                onClick={selesaikan}
                className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Simpan Penilaian
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

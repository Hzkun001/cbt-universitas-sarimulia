import re

with open('src/routes/_authenticated/admin.evaluasi.tsx', 'r') as f:
    content = f.read()

replacement = """import { createFileRoute, Link } from "@tanstack/react-router";
import { sesiRepo, ujianRepo, usersRepo, soalRepo } from "@/lib/cbt/repos";
import { useAuthStore } from "@/lib/cbt/auth-store";
import { visibleUjians } from "@/lib/cbt/access";
import { FileEdit, CheckCircle2, ChevronRight, AlertCircle, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/evaluasi")({
  component: EvaluasiList,
});

function EvaluasiList() {
  const user = useAuthStore((s) => s.user);
  const visibleIds = new Set(visibleUjians(user).map((u) => u.id));
  const sesis = sesiRepo.all().filter((s) => s.status === "selesai" && visibleIds.has(s.ujianId));
  const ujians = ujianRepo.all();
  const soals = soalRepo.all();
  const soalSet = new Set(soals.filter((s) => s.tipe === "essay").map((s) => s.id));

  // Group by Ujian
  const ujianMap = new Map<string, { ujian: any, totalSesi: number, belumSesi: number, totalEssay: number, belumEssay: number }>();

  sesis.forEach(s => {
    const essays = s.jawaban.filter((j) => soalSet.has(j.soalId));
    if (essays.length === 0) return;

    const belumCount = essays.filter((j) => typeof j.skor !== "number").length;
    
    if (!ujianMap.has(s.ujianId)) {
      const u = ujians.find(x => x.id === s.ujianId);
      if (!u) return;
      ujianMap.set(s.ujianId, { ujian: u, totalSesi: 0, belumSesi: 0, totalEssay: 0, belumEssay: 0 });
    }
    
    const entry = ujianMap.get(s.ujianId)!;
    entry.totalSesi += 1;
    entry.totalEssay += essays.length;
    entry.belumEssay += belumCount;
    if (belumCount > 0) {
      entry.belumSesi += 1;
    }
  });

  const items = Array.from(ujianMap.values()).sort((a, b) => b.belumSesi - a.belumSesi);
  const totalBelumSesi = items.reduce((acc, curr) => acc + curr.belumSesi, 0);

  return (
    <div className="relative min-h-screen pb-32">
      {/* Studio-Tier Glow Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/60 via-white to-white dark:from-indigo-950/20 dark:via-zinc-950 dark:to-zinc-950 -z-10" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest border border-indigo-200/50 dark:border-indigo-500/20">
            Koreksi Manual
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-zinc-50 leading-none">
            Evaluasi Essay
          </h1>
          <p className="text-base font-medium text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            {totalBelumSesi > 0 
              ? `${totalBelumSesi} mahasiswa menunggu penilaian essay di berbagai ujian.` 
              : "Luar biasa! Semua jawaban essay telah selesai dinilai."}
          </p>
        </div>

        <div className="space-y-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-24 text-center rounded-3xl border border-dashed border-slate-300 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm">
              <CheckCircle2 className="h-16 w-16 text-slate-300 dark:text-zinc-700 mb-6" />
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100 mb-2">Semua Bersih</h2>
              <p className="text-base font-medium text-slate-500 dark:text-zinc-400">Tidak ada ujian dengan soal essay yang membutuhkan koreksi manual.</p>
            </div>
          ) : (
            items.map(({ ujian, totalSesi, belumSesi, totalEssay, belumEssay }) => {
              const isWarning = belumSesi > 0;

              return (
                <Link
                  key={ujian.id}
                  to="/admin/evaluasi/ujian/$id"
                  params={{ id: ujian.id }}
                  className="group flex flex-col md:flex-row md:items-center justify-between p-6 sm:p-8 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-lg transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.01] active:scale-[0.99] gap-6"
                >
                  <div className="flex items-center gap-6 min-w-0">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-3 group-hover:scale-110">
                      <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {ujian.nama}
                      </h2>
                      <div className="text-sm font-semibold text-slate-500 dark:text-zinc-500 flex items-center gap-2">
                        Terdapat {totalSesi} sesi ({totalEssay} soal)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 justify-between md:justify-end">
                    <div className="text-right flex flex-col md:items-end">
                      {isWarning ? (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-500 text-xs font-black uppercase tracking-widest border border-amber-200/50 dark:border-amber-900/50">
                          <AlertCircle className="h-4 w-4" />
                          {belumSesi} Belum Dinilai
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-500 text-xs font-black uppercase tracking-widest border border-emerald-200/50 dark:border-emerald-900/50">
                          <CheckCircle2 className="h-4 w-4" />
                          Semua Tuntas
                        </div>
                      )}
                    </div>
                    
                    <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40">
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
"""

with open('src/routes/_authenticated/admin.evaluasi.tsx', 'w') as f:
    f.write(replacement)

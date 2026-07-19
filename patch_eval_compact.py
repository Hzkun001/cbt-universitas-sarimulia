import re

with open('src/routes/_authenticated/admin.evaluasi.tsx', 'r') as f:
    content = f.read()

replacement = """import { createFileRoute, Link } from "@tanstack/react-router";
import { sesiRepo, ujianRepo, usersRepo, soalRepo } from "@/lib/cbt/repos";
import { useAuthStore } from "@/lib/cbt/auth-store";
import { visibleUjians } from "@/lib/cbt/access";
import { CheckCircle2, ChevronRight, AlertCircle, FileText, FileSignature } from "lucide-react";

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
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Evaluasi Essay</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {totalBelumSesi > 0 
              ? `${totalBelumSesi} mahasiswa menunggu penilaian manual di berbagai ujian.` 
              : "Semua antrean koreksi essay telah diselesaikan."}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Antrean Bersih</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Tidak ada ujian yang memerlukan koreksi manual.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-200 dark:divide-zinc-800">
            {items.map(({ ujian, totalSesi, belumSesi, totalEssay }) => {
              const isWarning = belumSesi > 0;
              return (
                <div key={ujian.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
                      <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <Link to="/admin/evaluasi/ujian/$id" params={{ id: ujian.id }} className="font-semibold text-sm text-slate-900 dark:text-zinc-100 truncate hover:text-indigo-600 dark:hover:text-indigo-400">
                        {ujian.nama}
                      </Link>
                      <span className="text-[11px] text-slate-500 mt-1">
                        {totalSesi} Sesi • {totalEssay} Soal Essay Terjawab
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 sm:ml-4">
                    {isWarning ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 text-xs font-medium rounded-md border border-amber-200 dark:border-amber-800/50">
                        <AlertCircle className="h-3.5 w-3.5" /> {belumSesi} Antrean
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-500 text-xs font-medium rounded-md border border-emerald-200 dark:border-emerald-800/50">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
                      </div>
                    )}
                    <Link to="/admin/evaluasi/ujian/$id" params={{ id: ujian.id }} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-md text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 transition-colors">
                      Buka <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
"""

with open('src/routes/_authenticated/admin.evaluasi.tsx', 'w') as f:
    f.write(replacement)

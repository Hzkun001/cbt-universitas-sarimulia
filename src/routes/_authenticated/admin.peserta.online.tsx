import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { sesiRepo, ujianRepo, usersRepo } from "@/lib/cbt/repos";
import { Activity, AlertTriangle, Users, Timer, CheckCircle2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/peserta/online")({
  component: OnlinePage,
});

function fmtSisa(ms: number): string {
  if (ms <= 0) return "00:00";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function OnlinePage() {
  const [, tick] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = window.setInterval(() => tick((x) => x + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  const { sesis, ujians, users, totalPelanggaran, avgProgress } = useMemo(() => {
    const rawSesis = sesiRepo.all().filter((s) => s.status === "sedang");
    const ujians = ujianRepo.all();
    const users = usersRepo.all();

    let violations = 0;
    let totalPct = 0;

    const enriched = rawSesis.map((s) => {
      const u = users.find((x) => x.id === s.pesertaId);
      const ex = ujians.find((x) => x.id === s.ujianId);
      const dijawab = s.jawaban.filter((j) => j.jawabanIds.length > 0 || j.jawabanEssay.length > 0).length;
      const totalSoal = s.soalIds.length || 1;
      const progress = (dijawab / totalSoal) * 100;
      
      violations += s.pelanggaran;
      totalPct += progress;

      return { s, u, ex, dijawab, totalSoal, progress };
    });

    const filtered = enriched.filter(({ u, ex }) => 
      (u?.namaLengkap || "").toLowerCase().includes(search.toLowerCase()) ||
      (ex?.nama || "").toLowerCase().includes(search.toLowerCase())
    );

    return {
      sesis: filtered,
      ujians,
      users,
      totalPelanggaran: violations,
      avgProgress: rawSesis.length > 0 ? totalPct / rawSesis.length : 0
    };
  }, [tick, search]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">
              System Live
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Pantau Ujian</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Monitoring real-time aktivitas peserta, progres pengerjaan, dan deteksi anomali pelanggaran secara terpusat.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-4 rounded-lg shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-md bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/30">
            <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sesi Aktif</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100 leading-none mt-1">
              {sesis.length} <span className="text-sm font-medium text-slate-400">peserta</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-4 rounded-lg shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-md bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center border border-rose-100 dark:border-rose-800/30">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pelanggaran</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100 leading-none mt-1">
              {totalPelanggaran} <span className="text-sm font-medium text-slate-400">insiden</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-4 rounded-lg shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/30">
            <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rata-rata Progress</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100 leading-none mt-1">
              {Math.round(avgProgress)}%
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="p-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 px-2">Daftar Peserta Live</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Cari nama/ujian..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-sm"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-zinc-800">
          {sesis.map(({ s, u, ex, dijawab, totalSoal, progress }) => {
            const sisaMs = s.endsAt ? Math.max(0, s.endsAt - Date.now()) : 0;
            const isCritical = sisaMs > 0 && sisaMs < 300000;
            
            return (
              <div key={s.id} className="p-3 hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 md:w-1/3">
                  <div className="hidden sm:flex h-8 w-8 shrink-0 rounded-md bg-slate-100 dark:bg-zinc-800 items-center justify-center border border-slate-200 dark:border-zinc-700">
                    <Users className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100 truncate">{u?.namaLengkap ?? "Unknown"}</h3>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{ex?.nama ?? "Unknown Exam"}</div>
                  </div>
                </div>

                <div className="flex-1 w-full max-w-xs md:max-w-md">
                  <div className="flex justify-between items-center text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    <span>Progress</span>
                    <span>{dijawab} / {totalSoal}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 md:w-1/4 justify-between md:justify-end">
                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Sisa Waktu</div>
                    <div className={`font-mono text-sm font-bold flex items-center justify-end gap-1.5 ${isCritical ? 'text-rose-600 animate-pulse' : 'text-slate-900 dark:text-zinc-100'}`}>
                      <Timer className="h-3 w-3" />
                      {fmtSisa(sisaMs)}
                    </div>
                  </div>

                  <div className="w-20 text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Status</div>
                    {s.pelanggaran > 0 ? (
                      <div className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        {s.pelanggaran} INC
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                        AMAN
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {sesis.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-sm">
              Tidak ada peserta yang sedang aktif.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

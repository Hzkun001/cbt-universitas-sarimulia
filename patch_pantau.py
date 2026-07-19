import re

with open('src/routes/_authenticated/admin.peserta.online.tsx', 'r') as f:
    content = f.read()

replacement = """import { createFileRoute } from "@tanstack/react-router";
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
    // Refresh interval lowered to 1s for real-time countdown feel
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
  }, [tick, search]); // Re-compute on tick to keep timers smooth

  return (
    <div className="relative min-h-screen pb-24">
      {/* Studio-Tier Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-zinc-950 dark:to-zinc-950 -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12">
        {/* Header Section */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">
                System Live
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-zinc-50 leading-none">
              Pantau Ujian
            </h1>
            <p className="text-base text-slate-500 dark:text-zinc-400 font-medium max-w-xl leading-relaxed mt-2">
              Monitoring real-time aktivitas peserta, progres pengerjaan, dan deteksi anomali pelanggaran secara terpusat.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-3 mt-12">
          {/* Card 1 */}
          <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col gap-5">
            <div className="h-14 w-14 rounded-2xl bg-emerald-100/80 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-500/20 shadow-sm">
              <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500 mb-1.5">Sesi Aktif</div>
              <div className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-zinc-50">
                {sesis.length} <span className="text-lg font-bold text-slate-400 dark:text-zinc-600 ml-1">peserta</span>
              </div>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col gap-5">
            <div className="h-14 w-14 rounded-2xl bg-rose-100/80 dark:bg-rose-500/10 flex items-center justify-center border border-rose-200/50 dark:border-rose-500/20 shadow-sm">
              <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500 mb-1.5">Total Pelanggaran</div>
              <div className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-zinc-50">
                {totalPelanggaran} <span className="text-lg font-bold text-slate-400 dark:text-zinc-600 ml-1">insiden</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col gap-5">
            <div className="h-14 w-14 rounded-2xl bg-indigo-100/80 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-500/20 shadow-sm">
              <CheckCircle2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500 mb-1.5">Rata-rata Progress</div>
              <div className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-zinc-50">
                {Math.round(avgProgress)}%
              </div>
            </div>
          </div>
        </div>

        {/* Premium Toolbar */}
        <div className="p-3 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-zinc-800/60 shadow-sm mt-12 flex flex-col md:flex-row gap-4 items-center justify-between">
          <h2 className="text-xl font-black tracking-tight px-3 py-1 text-slate-900 dark:text-zinc-100">Peserta Berlangsung</h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <Input 
              placeholder="Cari nama atau ujian..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-white dark:bg-zinc-950 border-transparent hover:border-slate-200 dark:hover:border-zinc-800 focus:border-emerald-500 rounded-xl transition-all shadow-none text-base"
            />
          </div>
        </div>

        {/* Row Cards List */}
        <div className="space-y-4 mt-6">
          {sesis.map(({ s, u, ex, dijawab, totalSoal, progress }) => {
            const sisaMs = s.endsAt ? Math.max(0, s.endsAt - Date.now()) : 0;
            const isCritical = sisaMs > 0 && sisaMs < 300000; // < 5 mins
            
            return (
              <div key={s.id} className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Identitas */}
                <div className="flex items-center gap-5 min-w-0 md:w-1/3">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center border border-slate-200/50 dark:border-zinc-700/50">
                    <Users className="h-6 w-6 text-slate-500 dark:text-zinc-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100 truncate">{u?.namaLengkap ?? "Unknown"}</h3>
                    <div className="text-xs font-semibold text-slate-500 dark:text-zinc-500 truncate mt-1 bg-slate-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md inline-block">{ex?.nama ?? "Unknown Exam"}</div>
                  </div>
                </div>

                {/* Progress Mengerjakan */}
                <div className="flex-1 w-full space-y-2.5 md:px-6">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500">
                    <span>Progress</span>
                    <span className="text-slate-900 dark:text-zinc-100">{dijawab} / {totalSoal}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800/80 rounded-full h-3 border border-slate-200/50 dark:border-zinc-700/50 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-8 shrink-0 justify-between md:justify-end">
                  {/* Waktu */}
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500 mb-1">Sisa Waktu</div>
                    <div className={`font-mono text-xl font-black tracking-tight flex items-center justify-end gap-2 ${isCritical ? 'text-rose-600 dark:text-rose-500 animate-pulse' : 'text-slate-800 dark:text-zinc-200'}`}>
                      <Timer className="h-5 w-5" />
                      {fmtSisa(sisaMs)}
                    </div>
                  </div>

                  {/* Pelanggaran */}
                  <div className="w-28 text-right">
                    <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-zinc-500 mb-1.5">Pelanggaran</div>
                    {s.pelanggaran > 0 ? (
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm font-black border border-rose-200 dark:border-rose-500/20 shadow-sm shadow-rose-100 dark:shadow-none">
                        {s.pelanggaran} INC
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-sm font-bold border border-slate-200/50 dark:border-zinc-700/50">
                        AMAN
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {sesis.length === 0 && (
            <div className="py-24 text-center bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 dark:border-zinc-800">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-800 mb-6 border border-slate-200/50 dark:border-zinc-700/50 shadow-sm">
                <Activity className="h-10 w-10 text-slate-400 dark:text-zinc-500" />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100 mb-2">Tidak Ada Aktivitas Ujian</h3>
              <p className="text-base font-medium text-slate-500 dark:text-zinc-400">Saat ini tidak ada peserta yang sedang melangsungkan ujian di sistem.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
"""

with open('src/routes/_authenticated/admin.peserta.online.tsx', 'w') as f:
    f.write(replacement)

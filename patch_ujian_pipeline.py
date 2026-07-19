import re

with open('src/routes/_authenticated/admin.ujian.tsx', 'r') as f:
    content = f.read()

replacement = """import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useState } from "react";
import { ujianRepo, sesiRepo, mataKuliahRepo } from "@/lib/cbt/repos";
import { useAuthStore } from "@/lib/cbt/auth-store";
import { uid } from "@/lib/cbt/storage";
import type { Ujian } from "@/lib/cbt/types";
import { Plus, Users, BarChart3, KeyRound, PlayCircle, Clock, CheckCircle2, Settings2, FileSignature } from "lucide-react";
import { toast } from "sonner";
import { visibleUjians } from "@/lib/cbt/access";

export const Route = createFileRoute("/_authenticated/admin/ujian")({
	component: UjianRoute,
});

function UjianRoute() {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const isIndexRoute = pathname === "/admin/ujian" || pathname === "/admin/ujian/";
	if (!isIndexRoute) return <Outlet />;
	return <UjianList />;
}

function UjianList() {
	const user = useAuthStore((s) => s.user)!;
	const [list, setList] = useState<Ujian[]>(visibleUjians(user));

	function add() {
		const u: Ujian = {
			id: uid("ex_"),
			nama: "Ujian Baru",
			deskripsi: "",
			durasiMenit: 30,
			poinBenar: 1,
			poinSalah: 0,
			poinKosong: 0,
			tokenAktif: false,
			ipRange: "",
			groupIds: [],
			topicSets: [],
			showResult: true,
			showResultDetail: false,
			fullscreenWajib: true,
			maxPindahTab: 3,
			blokirShortcut: true,
			mode: "online",
			createdBy: user.id,
			createdAt: Date.now(),
		};
		ujianRepo.upsert(u);
		setList(visibleUjians(user));
		toast.success("Ujian baru dibuat — silakan edit");
	}

  const now = Date.now();
  const persiapan = list.filter((u) => !u.beginAt || !u.endAt || u.beginAt > now);
  const berlangsung = list.filter((u) => u.beginAt && u.endAt && u.beginAt <= now && u.endAt >= now);
  const selesai = list.filter((u) => u.endAt && u.endAt < now);

  const renderCard = (u: Ujian, type: "persiapan" | "berlangsung" | "selesai") => {
    const sesiCount = sesiRepo.all().filter((s) => s.ujianId === u.id).length;
    const soalCount = u.topicSets.reduce((a, b) => a + b.jumlah, 0);
    const mk = u.mataKuliahId ? mataKuliahRepo.byId(u.mataKuliahId) : null;

    return (
      <div key={u.id} className="group flex flex-col bg-white dark:bg-zinc-950/80 border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] hover:-translate-y-1 active:scale-95">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
              {u.nama}
            </h3>
            {mk && <p className="text-xs font-bold text-slate-500 dark:text-zinc-500 mt-1">{mk.nama}</p>}
          </div>
        </div>

        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-6 flex flex-wrap gap-2">
          <span className="bg-slate-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-md">{soalCount} Soal</span>
          <span className="bg-slate-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-md">{u.durasiMenit} Menit</span>
          {sesiCount > 0 && <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-500/20">{sesiCount} Sesi</span>}
        </div>

        <div className="mt-auto flex flex-wrap gap-3 pt-5 border-t border-slate-100 dark:border-zinc-800/80">
          {type === "persiapan" && (
            <>
              <Link to="/admin/ujian/$id" params={{ id: u.id }} className="flex-1 flex items-center justify-center gap-2 h-11 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-sm transition-transform active:scale-95 shadow-md">
                <Settings2 className="h-4 w-4"/> Edit
              </Link>
              <Link to="/admin/ujian/$id/peserta" params={{ id: u.id }} className="flex items-center justify-center w-11 h-11 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl border-2 border-slate-200 dark:border-zinc-700 transition-transform active:scale-95" title="Peserta">
                <Users className="h-4 w-4"/>
              </Link>
            </>
          )}
          {type === "berlangsung" && (
            <>
              <Link to="/admin/ujian/$id/token" params={{ id: u.id }} className="flex-1 flex items-center justify-center gap-2 h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-transform active:scale-95 shadow-md shadow-emerald-500/20">
                <KeyRound className="h-4 w-4"/> Token
              </Link>
              <Link to="/admin/peserta/online" search={{ ujianId: u.id }} className="flex items-center justify-center w-11 h-11 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl border-2 border-slate-200 dark:border-zinc-700 transition-transform active:scale-95" title="Pantau">
                <PlayCircle className="h-4 w-4"/>
              </Link>
            </>
          )}
          {type === "selesai" && (
            <>
              <Link to="/admin/analitik/$id" params={{ id: u.id }} className="flex-1 flex items-center justify-center gap-2 h-11 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl border-2 border-slate-200 dark:border-zinc-700 font-bold text-sm transition-transform active:scale-95 shadow-sm">
                <BarChart3 className="h-4 w-4"/> Analitik
              </Link>
              <Link to="/admin/evaluasi" className="flex items-center justify-center w-11 h-11 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-500/30 transition-transform active:scale-95" title="Evaluasi">
                <FileSignature className="h-4 w-4"/>
              </Link>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen pb-32">
      {/* Studio-Tier Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/60 via-white to-white dark:from-indigo-950/20 dark:via-zinc-950 dark:to-zinc-950 -z-10" />

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest border border-indigo-200/50 dark:border-indigo-500/20">
              Manajemen Paket
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-zinc-50 leading-none">
              Pipeline Ujian
            </h1>
            <p className="text-base font-medium text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed mt-2">
              Alur kerja terpusat paket ujian berdasarkan pelaksanaannya.
            </p>
          </div>
          
          <button onClick={add} className="flex items-center justify-center gap-2 px-6 h-12 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl font-bold transition-transform active:scale-95 shadow-lg shadow-slate-900/10">
            <Plus className="h-5 w-5" /> Buat Paket Ujian
          </button>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Persiapan */}
          <div className="flex flex-col gap-6 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200/80 dark:border-zinc-800/80 min-h-[600px] shadow-sm">
            <div className="flex items-center justify-between px-2 pt-2">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                <Clock className="h-5 w-5" /> Persiapan
              </h2>
              <span className="text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-3 py-1 rounded-lg border border-slate-200/50 dark:border-zinc-700/50 shadow-sm">{persiapan.length}</span>
            </div>
            <div className="flex flex-col gap-5">
              {persiapan.map((u) => renderCard(u, "persiapan"))}
              {persiapan.length === 0 && <div className="text-sm text-center font-bold text-slate-400 py-16 border-2 border-dashed rounded-3xl border-slate-200 dark:border-zinc-800">Sistem bersih</div>}
            </div>
          </div>

          {/* Berlangsung */}
          <div className="flex flex-col gap-6 bg-emerald-50/50 dark:bg-emerald-900/10 backdrop-blur-xl p-6 rounded-[2rem] border border-emerald-200/60 dark:border-emerald-800/30 min-h-[600px] shadow-sm">
            <div className="flex items-center justify-between px-2 pt-2">
              <h2 className="text-sm font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                Berlangsung
              </h2>
              <span className="text-xs font-bold bg-emerald-200/50 dark:bg-emerald-800/50 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-lg border border-emerald-300/50 dark:border-emerald-700/50 shadow-sm">{berlangsung.length}</span>
            </div>
            <div className="flex flex-col gap-5">
              {berlangsung.map((u) => renderCard(u, "berlangsung"))}
              {berlangsung.length === 0 && <div className="text-sm text-center font-bold text-emerald-600/50 dark:text-emerald-400/50 py-16 border-2 border-dashed rounded-3xl border-emerald-200/50 dark:border-emerald-900/30">Tidak ada ujian aktif</div>}
            </div>
          </div>

          {/* Selesai */}
          <div className="flex flex-col gap-6 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200/80 dark:border-zinc-800/80 min-h-[600px] shadow-sm">
            <div className="flex items-center justify-between px-2 pt-2">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" /> Selesai
              </h2>
              <span className="text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 px-3 py-1 rounded-lg border border-slate-200/50 dark:border-zinc-700/50 shadow-sm">{selesai.length}</span>
            </div>
            <div className="flex flex-col gap-5">
              {selesai.map((u) => renderCard(u, "selesai"))}
              {selesai.length === 0 && <div className="text-sm text-center font-bold text-slate-400 py-16 border-2 border-dashed rounded-3xl border-slate-200 dark:border-zinc-800">Kosong</div>}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
"""

with open('src/routes/_authenticated/admin.ujian.tsx', 'w') as f:
    f.write(replacement)

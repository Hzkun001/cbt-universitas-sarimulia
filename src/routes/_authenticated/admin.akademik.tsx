import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Building2, GraduationCap, Network, Calendar, Clock, BookOpen, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/akademik")({
  component: AkademikLayout,
});

const TREE_MENU = [
  {
    section: "Struktur Institusi",
    items: [
      { label: "Fakultas", to: "/admin/akademik/fakultas", icon: Building2, indent: 0 },
      { label: "Jurusan", to: "/admin/akademik/jurusan", icon: Network, indent: 1 },
      { label: "Program Studi", to: "/admin/akademik/prodi", icon: GraduationCap, indent: 2 },
    ]
  },
  {
    section: "Waktu Perkuliahan",
    items: [
      { label: "Tahun Akademik", to: "/admin/akademik/tahun-akademik", icon: Calendar, indent: 0 },
      { label: "Semester", to: "/admin/akademik/semester", icon: Clock, indent: 1 },
    ]
  },
  {
    section: "Kurikulum",
    items: [
      { label: "Mata Kuliah", to: "/admin/akademik/mata-kuliah", icon: BookOpen, indent: 0 },
    ]
  }
];

function AkademikLayout() {
  const { pathname } = useLocation();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Data Akademik
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Kelola data induk institusi. Konfigurasi di sini akan menjadi fondasi bagi pengelolaan mahasiswa, dosen, dan mata kuliah.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 shrink-0 space-y-8">
          {TREE_MENU.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {group.section}
              </h4>
              <nav className="flex flex-col space-y-1">
                {group.items.map((item) => {
                  const active = pathname.startsWith(item.to);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        active
                          ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                      )}
                      style={{ marginLeft: `${item.indent * 12}px` }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn(
                          "h-4 w-4 shrink-0", 
                          active ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                        )} />
                        {item.label}
                      </div>
                      {active && <ChevronRight className="h-4 w-4 opacity-50" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </aside>

        {/* Content Outlet */}
        <main className="flex-1 w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px] overflow-hidden">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

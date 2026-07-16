import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/akademik")({
  component: AkademikLayout,
});

const TABS = [
  { label: "Fakultas", to: "/admin/akademik/fakultas" },
  { label: "Jurusan", to: "/admin/akademik/jurusan" },
  { label: "Program Studi", to: "/admin/akademik/prodi" },
  { label: "Tahun Akademik", to: "/admin/akademik/tahun-akademik" },
  { label: "Semester", to: "/admin/akademik/semester" },
  { label: "Mata Kuliah", to: "/admin/akademik/mata-kuliah" },
];

function AkademikLayout() {
  const { pathname } = useLocation();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Data Akademik</h1>
      <div className="flex border-b">
        {TABS.map((tab) => {
          const active = pathname === tab.to;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[2px]",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <div className="max-w-4xl">
        <Outlet />
      </div>
    </div>
  );
}

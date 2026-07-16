import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useAuthStore } from "@/lib/cbt/auth-store";
import { configRepo, hydrateRepos } from "@/lib/cbt/repos";
import { type AppConfig, type NavKey, type Role } from "@/lib/cbt/types";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Trophy,
  Wrench,
  FolderOpen,
  PenLine,
  Activity,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_ROUTE_RULES = {
  root: { key: "dashboard", adminOnly: false, paths: ["/admin"] },
  users: { key: "users", adminOnly: true, paths: ["/admin/users"] },
  akademik: { key: "akademik", adminOnly: true, paths: ["/admin/akademik"] },
  peserta: { key: "peserta", adminOnly: false, paths: ["/admin/peserta"] },
  modul: { key: "modul", adminOnly: false, paths: ["/admin/modul", "/admin/topik"] },
  files: { key: "files", adminOnly: false, paths: ["/admin/files"] },
  ujian: { key: "ujian", adminOnly: false, paths: ["/admin/ujian"] },
  hasil: { key: "hasil", adminOnly: false, paths: ["/admin/hasil"] },
  evaluasi: { key: "evaluasi", adminOnly: false, paths: ["/admin/evaluasi"] },
  laporan: { key: "laporan", adminOnly: false, paths: ["/admin/laporan"] },
  leaderboard: { key: "leaderboard", adminOnly: false, paths: ["/admin/leaderboard"] },
  pengaturan: { key: "pengaturan", adminOnly: true, paths: ["/admin/pengaturan"] },
  tools: { key: "tools", adminOnly: true, paths: ["/admin/tools"] },
} satisfies Record<string, { key: NavKey; adminOnly: boolean; paths: string[] }>;

type AdminRouteRule = (typeof ADMIN_ROUTE_RULES)[keyof typeof ADMIN_ROUTE_RULES];
type RouteUser = { role: Role };

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const navItems: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Pengguna", icon: Users },
  { to: "/admin/akademik", label: "Akademik", icon: Landmark },
  { to: "/admin/peserta", label: "Peserta", icon: GraduationCap },
  { to: "/admin/peserta/online", label: "Peserta Online", icon: Activity },
  { to: "/admin/modul", label: "Bank Soal", icon: BookOpen },
  { to: "/admin/files", label: "File Manager", icon: FolderOpen },
  { to: "/admin/ujian", label: "Paket Ujian", icon: FileText },
  { to: "/admin/hasil", label: "Hasil & Riwayat", icon: ClipboardList },
  { to: "/admin/evaluasi", label: "Evaluasi Essay", icon: PenLine },
  { to: "/admin/laporan", label: "Laporan", icon: BarChart3 },
  { to: "/admin/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
  { to: "/admin/tools", label: "Backup & Tools", icon: Wrench },
];

function normalizedAdminPath(pathname: string) {
  if (pathname === "/admin") return pathname;
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function resolveAdminRouteRule(pathname: string): AdminRouteRule | null {
  const normalized = normalizedAdminPath(pathname);
  const rules = Object.values(ADMIN_ROUTE_RULES).flatMap((rule) =>
    rule.paths.map((path) => ({ path, rule })),
  );
  const match = rules
    .filter(({ path }) => normalized === path || normalized.startsWith(`${path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];
  return match?.rule ?? null;
}

function operatorAccessKeys(cfg: AppConfig, role: Role) {
  return new Set((cfg.roleAccess[role] ?? []) as NavKey[]);
}

export function canAccessAdminPath(user: RouteUser, pathname: string, cfg: AppConfig) {
  if (user.role === "super_admin") return true;
  if (user.role === "mahasiswa") return false;
  const rule = resolveAdminRouteRule(pathname);
  if (!rule) return false;
  if (rule.adminOnly) return false;
  return operatorAccessKeys(cfg, user.role).has(rule.key);
}

function firstAllowedAdminPath(user: RouteUser, cfg: AppConfig) {
  if (user.role === "super_admin") return "/admin";
  const firstVisible = navItems.find((item) => canAccessAdminPath(user, item.to, cfg));
  return firstVisible?.to ?? "/login";
}

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context, location }) => {
    const user = (context as { user: RouteUser }).user;
    if (user.role === "mahasiswa") throw redirect({ to: "/peserta" });

    try {
      await hydrateRepos();
    } catch {
      // gunakan cache terakhir/default agar guard tetap deterministik
    }

    const cfg = configRepo.get();
    if (!canAccessAdminPath(user, location.pathname, cfg)) {
      throw redirect({ to: firstAllowedAdminPath(user, cfg) });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const user = useAuthStore((s) => s.user)!;
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const cfg = configRepo.get();
  const appName = cfg.appName;

  const visible = navItems.filter((item) => canAccessAdminPath(user, item.to, cfg));

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <aside className="hidden w-64 shrink-0 border-r bg-sidebar text-sidebar-foreground lg:block">
          <div className="flex h-14 items-center gap-2 border-b px-4 font-semibold">
            {cfg.appLogo ? (
              <img src={cfg.appLogo} alt="Logo" className="h-7 w-auto object-contain" />
            ) : (
              <span className="grid h-7 w-7 place-items-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                Z
              </span>
            )}
            <span className="truncate">{appName}</span>
          </div>
          <nav className="space-y-1 p-3">
            {visible.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to as never}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "hover:bg-sidebar-accent/60",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b bg-card px-4 lg:px-6">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{user.namaLengkap}</span>
              <span className="ml-2 rounded bg-accent px-1.5 py-0.5 text-xs font-medium text-accent-foreground">
                {user.role}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await logout();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="mr-1 h-4 w-4" /> Keluar
            </Button>
          </header>
          <main className="flex-1 p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

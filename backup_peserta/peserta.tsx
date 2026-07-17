import {
	createFileRoute,
	Outlet,
	redirect,
	useNavigate,
	useLocation,
} from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/cbt/auth-store";
import { configRepo, hydrateRepos } from "@/lib/cbt/repos";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/peserta")({
<<<<<<< HEAD
	beforeLoad: async ({ context }) => {
		const user = (context as { user: { role: string } }).user;
		if (user.role !== "peserta") throw redirect({ to: "/admin" });

		try {
			await hydrateRepos();
		} catch {
			// fallback on error
		}
	},
	component: PesertaLayout,
});

function PesertaLayout() {
	const user = useAuthStore((s) => s.user)!;
	const logout = useAuthStore((s) => s.logout);
	const navigate = useNavigate();
	const appName = configRepo.get().appName;

	const location = useLocation();
	const isKerjakan = location.pathname.endsWith("/kerjakan");

	return (
		<div className={cn("bg-muted/30 flex flex-col", isKerjakan ? "h-screen overflow-hidden" : "min-h-screen")}>
			<header className="flex h-16 items-center justify-between bg-[#03A559] px-4 md:px-6 text-white shadow-md z-10 shrink-0">
				<div className="flex items-center gap-3">
					<img
						src="/logo-unism.jpg"
						alt="Logo"
						className="h-10 w-10 bg-white rounded-full p-0.5 object-cover"
					/>
					<div>
						<h1 className="text-lg md:text-xl font-bold leading-tight tracking-wide">UNIVERSITAS SARI MULIA</h1>
						<div className="text-xs tracking-wider opacity-90 hidden sm:block">Computer Based Test</div>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<div className="text-right hidden sm:block">
						<div className="font-semibold text-sm">{user.namaLengkap}</div>
						<div className="text-xs opacity-90">{user.username}</div>
					</div>
					<button 
						className="bg-[#028A4A] hover:bg-[#027A41] p-2 rounded transition"
						title="Keluar"
						onClick={async () => {
							if (isKerjakan) {
								if (!confirm("Keluar dari ujian? Waktu akan terus berjalan.")) return;
							}
							await logout();
							navigate({ to: "/login" });
						}}
					>
						<LogOut className="h-5 w-5" />
					</button>
				</div>
			</header>
			<main className="flex-1 w-full flex flex-col min-h-0">
				<Outlet />
			</main>
		</div>
	);
=======
  beforeLoad: ({ context }) => {
    const user = (context as { user: { role: string } }).user;
    if (user.role !== "mahasiswa") throw redirect({ to: "/admin" });
  },
  component: PesertaLayout,
});

function PesertaLayout() {
  const user = useAuthStore((s) => s.user)!;
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const cfg = configRepo.get();
  const appName = cfg.appName;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            {cfg.appLogo ? (
              <img src={cfg.appLogo} alt="Logo" className="h-7 w-auto object-contain" />
            ) : (
              <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
                Z
              </span>
            )}
            <span className="truncate">{appName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.namaLengkap}</span>
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
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
>>>>>>> 6ee9fb29b4f15150ac2f9281c0a7b10e952c358f
}

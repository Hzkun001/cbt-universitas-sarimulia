import { createFileRoute, Link } from "@tanstack/react-router";
import { sesiRepo, mataKuliahRepo, semesterRepo } from "@/lib/cbt/repos";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/cbt/auth-store";
import { visibleUjians } from "@/lib/cbt/access";
import { BookOpen, Users, CheckCircle2, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/hasil")({
  component: HasilIndex,
});

function HasilIndex() {
  const user = useAuthStore((s) => s.user);
  const ujians = visibleUjians(user);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hasil & Riwayat Ujian</h1>
        <p className="text-sm text-muted-foreground mt-1">Pilih paket ujian untuk melihat daftar peserta dan melakukan penilaian esai.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ujians.map((u) => {
          const sesis = sesiRepo.all().filter((s) => s.ujianId === u.id);
          const selesai = sesis.filter((s) => s.status === "selesai");
          const avg = selesai.length ? (selesai.reduce((a, b) => a + (b.skorTotal ?? 0), 0) / selesai.length).toFixed(1) : "-";
          
          const mk = u.mataKuliahId ? mataKuliahRepo.byId(u.mataKuliahId) : null;
          const smt = u.semesterId ? semesterRepo.byId(u.semesterId) : null;

          return (
            <Link key={u.id} to="/admin/hasil/$id" params={{ id: u.id }} className="block group">
              <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/50">
                <CardContent className="p-0">
                  <div className="bg-muted/30 border-b p-4">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{u.nama}</h3>
                    {mk && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mt-1.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span className="line-clamp-1">{mk.nama} {smt ? `· ${smt.nama}` : ""}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" /> Total Sesi
                      </div>
                      <div className="font-medium text-base">{sesis.length}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Selesai
                      </div>
                      <div className="font-medium text-base">{selesai.length}</div>
                    </div>
                    <div className="col-span-2 space-y-1 pt-2 border-t border-dashed">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" /> Rata-rata Skor Kelas
                      </div>
                      <div className="font-semibold text-lg text-primary">{avg}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {ujians.length === 0 && (
          <div className="col-span-full py-12 text-center border rounded-lg border-dashed bg-muted/20">
            <p className="text-muted-foreground">Belum ada ujian yang tersedia untuk Anda kelola.</p>
          </div>
        )}
      </div>
    </div>
  );
}

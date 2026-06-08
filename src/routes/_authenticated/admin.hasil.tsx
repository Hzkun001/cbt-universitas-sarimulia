import { createFileRoute, Link } from "@tanstack/react-router";
import { sesiRepo } from "@/lib/cbt/repos";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/cbt/auth-store";
import { visibleUjians } from "@/lib/cbt/access";

export const Route = createFileRoute("/_authenticated/admin/hasil")({
  component: HasilIndex,
});

function HasilIndex() {
  const user = useAuthStore((s) => s.user);
  const ujians = visibleUjians(user);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Hasil & Riwayat Ujian</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {ujians.map((u) => {
          const sesis = sesiRepo.all().filter((s) => s.ujianId === u.id);
          const selesai = sesis.filter((s) => s.status === "selesai");
          const avg = selesai.length ? (selesai.reduce((a, b) => a + (b.skorTotal ?? 0), 0) / selesai.length).toFixed(1) : "-";
          return (
            <Link key={u.id} to="/admin/hasil/$id" params={{ id: u.id }}>
              <Card className="hover:bg-muted/40 transition">
                <CardContent className="p-4">
                  <h3 className="font-medium">{u.nama}</h3>
                  <p className="text-xs text-muted-foreground">{sesis.length} sesi · {selesai.length} selesai · rata-rata skor: {avg}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {ujians.length === 0 && <div className="text-muted-foreground">Belum ada ujian.</div>}
      </div>
      <p className="text-xs text-muted-foreground">Tip: pilih paket ujian untuk melihat daftar peserta dan jawabannya.</p>
    </div>
  );
}

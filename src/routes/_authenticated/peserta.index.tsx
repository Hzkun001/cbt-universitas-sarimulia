import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/cbt/auth-store";
import { ujianRepo, sesiRepo } from "@/lib/cbt/repos";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/peserta/")({
  component: PesertaDashboard,
});

function PesertaDashboard() {
  const user = useAuthStore((s) => s.user)!;
  const ujian = ujianRepo
    .all()
    .filter((u) => !u.groupIds.length || (user.groupId && u.groupIds.includes(user.groupId)));
  const sesi = sesiRepo.all().filter((s) => s.pesertaId === user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Halo, {user.namaLengkap}</h1>
        <p className="text-sm text-muted-foreground">Berikut daftar ujian yang tersedia untuk Anda.</p>
      </div>

      {ujian.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Belum ada ujian yang diberikan untuk Anda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ujian.map((u) => {
            const s = sesi.find((x) => x.ujianId === u.id);
            const status = s?.status ?? "belum";
            const selesai = status === "selesai";
            return (
              <Card key={u.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    {u.nama}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" /> Durasi {u.durasiMenit} menit ·{" "}
                    {u.topicSets.reduce((a, b) => a + b.jumlah, 0)} soal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    className="text-sm text-muted-foreground line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: u.deskripsi }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                      {status}
                    </span>
                    {selesai ? (
                      <Button asChild size="sm" variant="outline">
                        <Link to="/peserta/ujian/$id/hasil" params={{ id: u.id }}>
                          Lihat Hasil
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm">
                        <Link to="/peserta/ujian/$id" params={{ id: u.id }}>
                          {status === "sedang" ? "Lanjutkan" : "Mulai"}
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

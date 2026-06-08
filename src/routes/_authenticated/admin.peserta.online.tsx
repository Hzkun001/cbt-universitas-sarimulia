import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { sesiRepo, ujianRepo, usersRepo } from "@/lib/cbt/repos";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/peserta/online")({
  component: OnlinePage,
});

function fmtSisa(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function OnlinePage() {
  const [, tick] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => tick((x) => x + 1), 5000);
    return () => window.clearInterval(t);
  }, []);

  const sesis = sesiRepo.all().filter((s) => s.status === "sedang");
  const ujians = ujianRepo.all();
  const users = usersRepo.all();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Peserta Online</h1>
        <p className="text-sm text-muted-foreground">
          Sesi ujian yang sedang berlangsung di browser ini · auto-refresh 5 detik
          {" · "}
          <span className="text-warning">
            (multi-device baru aktif setelah backend realtime diaktifkan)
          </span>
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left">
              <tr>
                <th className="p-3">Peserta</th>
                <th className="p-3">Ujian</th>
                <th className="p-3">Mulai</th>
                <th className="p-3">Sisa Waktu</th>
                <th className="p-3">Dijawab</th>
                <th className="p-3">Pelanggaran</th>
              </tr>
            </thead>
            <tbody>
              {sesis.map((s) => {
                const u = users.find((x) => x.id === s.pesertaId);
                const ex = ujians.find((x) => x.id === s.ujianId);
                const sisa = s.endsAt ? Math.max(0, s.endsAt - Date.now()) : 0;
                const dijawab = s.jawaban.filter(
                  (j) => j.jawabanIds.length > 0 || j.jawabanEssay.length > 0,
                ).length;
                return (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{u?.namaLengkap ?? "-"}</td>
                    <td className="p-3">{ex?.nama ?? "-"}</td>
                    <td className="p-3 text-xs">
                      {s.mulaiAt ? new Date(s.mulaiAt).toLocaleTimeString("id-ID") : "-"}
                    </td>
                    <td className="p-3 font-mono">{fmtSisa(sisa)}</td>
                    <td className="p-3">
                      {dijawab} / {s.soalIds.length}
                    </td>
                    <td className="p-3">
                      {s.pelanggaran > 0 ? (
                        <span className="text-destructive font-medium">{s.pelanggaran}</span>
                      ) : (
                        0
                      )}
                    </td>
                  </tr>
                );
              })}
              {sesis.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    Tidak ada peserta sedang ujian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

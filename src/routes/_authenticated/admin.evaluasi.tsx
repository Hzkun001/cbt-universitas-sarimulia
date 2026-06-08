import { createFileRoute, Link } from "@tanstack/react-router";
import { sesiRepo, ujianRepo, usersRepo, soalRepo } from "@/lib/cbt/repos";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/cbt/auth-store";
import { visibleUjians } from "@/lib/cbt/access";

export const Route = createFileRoute("/_authenticated/admin/evaluasi")({
  component: EvaluasiList,
});

function EvaluasiList() {
  const user = useAuthStore((s) => s.user);
  const visibleIds = new Set(visibleUjians(user).map((u) => u.id));
  const sesis = sesiRepo.all().filter((s) => s.status === "selesai" && visibleIds.has(s.ujianId));
  const users = usersRepo.all();
  const ujians = ujianRepo.all();
  const soals = soalRepo.all();
  const soalSet = new Set(soals.filter((s) => s.tipe === "essay").map((s) => s.id));

  const items = sesis
    .map((s) => {
      const essays = s.jawaban.filter((j) => soalSet.has(j.soalId));
      const belum = essays.filter((j) => typeof j.skor !== "number").length;
      return { sesi: s, total: essays.length, belum };
    })
    .filter((x) => x.total > 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Evaluasi Essay</h1>
        <p className="text-sm text-muted-foreground">
          Sesi yang memuat soal essay — beri nilai manual di sini.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left">
              <tr>
                <th className="p-3">Peserta</th>
                <th className="p-3">Ujian</th>
                <th className="p-3">Essay</th>
                <th className="p-3">Belum dinilai</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map(({ sesi, total, belum }) => {
                const u = users.find((x) => x.id === sesi.pesertaId);
                const ex = ujians.find((x) => x.id === sesi.ujianId);
                return (
                  <tr key={sesi.id} className="border-b last:border-0">
                    <td className="p-3">{u?.namaLengkap ?? "-"}</td>
                    <td className="p-3">{ex?.nama ?? "-"}</td>
                    <td className="p-3">{total}</td>
                    <td className="p-3">
                      {belum === 0 ? (
                        <span className="text-success">Selesai</span>
                      ) : (
                        <span className="text-warning font-medium">{belum}</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to="/admin/evaluasi/$id"
                        params={{ id: sesi.id }}
                        className="text-primary hover:underline"
                      >
                        Nilai
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    Tidak ada sesi essay yang perlu dinilai.
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

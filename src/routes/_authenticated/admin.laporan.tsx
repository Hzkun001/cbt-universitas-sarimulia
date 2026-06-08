import { createFileRoute, Link } from "@tanstack/react-router";
import { ujianRepo, sesiRepo, usersRepo, soalRepo, topikRepo, modulRepo } from "@/lib/cbt/repos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, FileText, GraduationCap, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/laporan")({
  component: LaporanPage,
});

function LaporanPage() {
  const ujian = ujianRepo.all();
  const sesi = sesiRepo.all();
  const users = usersRepo.all();
  const peserta = users.filter((u) => u.role === "peserta");

  const stats = ujian.map((u) => {
    const s = sesi.filter((x) => x.ujianId === u.id);
    const selesai = s.filter((x) => x.status === "selesai");
    const avg = selesai.length
      ? Math.round(
          (selesai.reduce((a, b) => a + (b.skorTotal ?? 0), 0) / selesai.length) * 10,
        ) / 10
      : 0;
    const maxSkor = selesai[0]?.maxSkor ?? 0;
    return {
      id: u.id,
      nama: u.nama,
      jumlahPeserta: s.length,
      jumlahSelesai: selesai.length,
      avg,
      maxSkor,
    };
  });

  const totalSelesai = sesi.filter((s) => s.status === "selesai").length;
  const totalSedang = sesi.filter((s) => s.status === "sedang").length;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin" className="text-sm text-muted-foreground hover:underline">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" /> Laporan
        </h1>
        <p className="text-sm text-muted-foreground">Ringkasan aktivitas ujian dan bank soal.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Peserta" value={peserta.length} icon={GraduationCap} />
        <StatCard label="Paket Ujian" value={ujian.length} icon={FileText} />
        <StatCard label="Sesi Selesai" value={totalSelesai} icon={CheckCircle2} />
        <StatCard label="Sedang Berjalan" value={totalSedang} icon={BarChart3} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Per Paket Ujian</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left">
              <tr>
                <th className="p-3">Nama</th>
                <th className="p-3">Peserta</th>
                <th className="p-3">Selesai</th>
                <th className="p-3">Rata-rata Skor</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {stats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    Belum ada paket ujian.
                  </td>
                </tr>
              ) : (
                stats.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{r.nama}</td>
                    <td className="p-3">{r.jumlahPeserta}</td>
                    <td className="p-3">{r.jumlahSelesai}</td>
                    <td className="p-3">
                      {r.avg} {r.maxSkor ? <span className="text-xs text-muted-foreground">/ {r.maxSkor}</span> : null}
                    </td>
                    <td className="p-3">
                      <Link
                        to="/admin/hasil/$id"
                        params={{ id: r.id }}
                        className="text-primary hover:underline"
                      >
                        Detail hasil
                      </Link>
                      {" · "}
                      <Link
                        to="/admin/leaderboard/$id"
                        params={{ id: r.id }}
                        className="text-primary hover:underline"
                      >
                        Leaderboard
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Soal</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Stat l="Modul" v={modulRepo.all().length} />
          <Stat l="Topik" v={topikRepo.all().length} />
          <Stat l="Soal" v={soalRepo.all().length} />
          <Stat l="Pengguna" v={users.length} />
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function Stat({ l, v }: { l: string; v: number }) {
  return (
    <div className="rounded border bg-muted/30 p-3">
      <div className="text-xs text-muted-foreground">{l}</div>
      <div className="text-xl font-semibold">{v}</div>
    </div>
  );
}

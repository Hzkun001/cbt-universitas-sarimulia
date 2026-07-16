import { createFileRoute, Link } from "@tanstack/react-router";
import { ujianRepo, sesiRepo, usersRepo, soalRepo, topikRepo, modulRepo, mataKuliahRepo, semesterRepo } from "@/lib/cbt/repos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, FileText, GraduationCap, CheckCircle2, TrendingUp, BookOpen, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/laporan")({
  component: LaporanPage,
});

function LaporanPage() {
  const ujian = ujianRepo.all();
  const sesi = sesiRepo.all();
  const users = usersRepo.all();
  const peserta = users.filter((u) => u.role === "mahasiswa");

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
      mataKuliahId: u.mataKuliahId,
      semesterId: u.semesterId,
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
        <StatCard label="Total Peserta Ujian" value={peserta.length} icon={GraduationCap} />
        <StatCard label="Total Paket Ujian" value={ujian.length} icon={FileText} />
        <StatCard label="Sesi Diselesaikan" value={totalSelesai} icon={CheckCircle2} />
        <StatCard label="Sedang Berlangsung" value={totalSedang} icon={TrendingUp} />
      </div>

      <Card className="shadow-sm border-0 ring-1 ring-border/50">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <CardTitle>Per Paket Ujian</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground font-medium">
              <tr>
                <th className="p-4 font-semibold">Nama Ujian</th>
                <th className="p-4 font-semibold">Partisipasi</th>
                <th className="p-4 font-semibold">Rata-rata Skor</th>
                <th className="p-4 font-semibold text-right">Aksi & Laporan</th>
              </tr>
            </thead>
            <tbody>
              {stats.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground border-t border-dashed">
                    Belum ada data pelaksanaan paket ujian.
                  </td>
                </tr>
              ) : (
                stats.map((r) => {
                  const mk = r.mataKuliahId ? mataKuliahRepo.byId(r.mataKuliahId) : null;
                  const smt = r.semesterId ? semesterRepo.byId(r.semesterId) : null;
                  return (
                    <tr key={r.id} className="border-t transition-colors hover:bg-muted/30">
                      <td className="p-4">
                        <div className="font-semibold text-base">{r.nama}</div>
                        {mk && (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mt-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {mk.nama} {smt ? `· ${smt.nama}` : ""}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="text-base font-semibold">{r.jumlahSelesai} <span className="text-muted-foreground text-sm font-normal">/ {r.jumlahPeserta} selesai</span></div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${r.jumlahPeserta > 0 ? (r.jumlahSelesai/r.jumlahPeserta)*100 : 0}%` }} />
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-lg text-primary">{r.avg}</span> {r.maxSkor ? <span className="text-sm text-muted-foreground">/ {r.maxSkor}</span> : null}
                      </td>
                      <td className="p-4 text-right space-x-3">
                        <Link
                          to="/admin/hasil/$id"
                          params={{ id: r.id }}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Penilaian
                        </Link>
                        <span className="text-muted-foreground">|</span>
                        <Link
                          to="/admin/leaderboard/$id"
                          params={{ id: r.id }}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Peringkat
                        </Link>
                      </td>
                    </tr>
                  );
                })
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
    <Card className="shadow-sm border-0 ring-1 ring-border/50 relative overflow-hidden group hover:ring-primary/50 transition-all">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors z-0" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-semibold text-muted-foreground">{label}</CardTitle>
        <div className="p-2 bg-muted/50 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-4xl font-bold tracking-tight text-foreground">{value}</div>
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

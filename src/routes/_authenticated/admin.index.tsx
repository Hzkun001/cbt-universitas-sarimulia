import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/cbt/auth-store";
import {
  usersRepo,
  groupsRepo,
  modulRepo,
  topikRepo,
  soalRepo,
  ujianRepo,
  sesiRepo,
} from "@/lib/cbt/repos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, GraduationCap, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const user = useAuthStore((s) => s.user)!;
  const counts = {
    pengguna: usersRepo.all().length,
    peserta: usersRepo.all().filter((u) => u.role === "mahasiswa").length,
    group: groupsRepo.all().length,
    modul: modulRepo.all().length,
    topik: topikRepo.all().length,
    soal: soalRepo.all().length,
    ujian: ujianRepo.all().length,
    sesi: sesiRepo.all().length,
  };

  const stats = [
    { label: "Peserta", value: counts.peserta, icon: GraduationCap, hint: `${counts.group} group` },
    { label: "Modul", value: counts.modul, icon: BookOpen, hint: `${counts.topik} topik` },
    { label: "Soal", value: counts.soal, icon: FileText, hint: "Bank soal" },
    { label: "Paket Ujian", value: counts.ujian, icon: Users, hint: `${counts.sesi} sesi` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Selamat datang, {user.namaLengkap}</h1>
        <p className="text-sm text-muted-foreground">Ringkasan sistem ujian saat ini.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{s.value}</div>
                <p className="text-xs text-muted-foreground">{s.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status implementasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Milestone 1 selesai: fondasi (storage, auth terpadu PBKDF2, role guard, dashboard).
          </p>
          <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
            <li>✅ Login terpadu (admin / operator / peserta) dengan password ter-hash</li>
            <li>✅ Seed data: 1 admin, 1 guru, 5 peserta, 2 modul, 4 topik, 16 soal demo, 1 paket ujian</li>
            <li>✅ Repository pattern (siap migrasi ke Cloud)</li>
            <li>⏳ Berikutnya: CRUD pengguna, bank soal (rich editor + KaTeX), editor paket ujian, halaman pengerjaan</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

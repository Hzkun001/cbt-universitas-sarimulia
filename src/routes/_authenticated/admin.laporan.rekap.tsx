import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { sesiRepo, usersRepo, groupsRepo } from "@/lib/cbt/repos";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { exportSheet } from "@/lib/cbt/excel";
import { useAuthStore } from "@/lib/cbt/auth-store";
import { visibleUjians } from "@/lib/cbt/access";

export const Route = createFileRoute("/_authenticated/admin/laporan/rekap")({
  component: RekapPage,
});

function RekapPage() {
  const user = useAuthStore((s) => s.user);
  const ujians = visibleUjians(user);
  const visibleUjianIds = new Set(ujians.map((u) => u.id));
  const groups = groupsRepo.all();
  const users = usersRepo.all();
  const [ujianId, setUjianId] = useState<string>("all");
  const [groupId, setGroupId] = useState<string>("all");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

  const sesi = sesiRepo.all().filter((s) => {
    if (s.status !== "selesai") return false;
    if (!visibleUjianIds.has(s.ujianId)) return false;
    if (ujianId !== "all" && s.ujianId !== ujianId) return false;
    const u = users.find((x) => x.id === s.pesertaId);
    if (groupId !== "all" && u?.groupId !== groupId) return false;
    if (dari && (s.selesaiAt ?? 0) < new Date(dari).getTime()) return false;
    if (sampai && (s.selesaiAt ?? 0) > new Date(sampai).getTime() + 86_400_000) return false;
    return true;
  });

  const rows = sesi.map((s) => {
    const u = users.find((x) => x.id === s.pesertaId);
    const ex = ujians.find((x) => x.id === s.ujianId);
    const g = groups.find((x) => x.id === u?.groupId);
    const durasi = s.mulaiAt && s.selesaiAt ? Math.round((s.selesaiAt - s.mulaiAt) / 1000) : 0;
    return {
      nama: u?.namaLengkap ?? "-",
      username: u?.username ?? "-",
      group: g?.nama ?? "-",
      ujian: ex?.nama ?? "-",
      skor: s.skorTotal ?? 0,
      maks: s.maxSkor ?? 0,
      persen: s.maxSkor ? Math.round(((s.skorTotal ?? 0) / s.maxSkor) * 1000) / 10 : 0,
      durasi,
      tanggal: s.selesaiAt ? new Date(s.selesaiAt).toLocaleString("id-ID") : "-",
    };
  });

  function exportExcel() {
    const aoa: (string | number)[][] = [
      ["Nama", "Username", "Group", "Ujian", "Skor", "Maks", "Persen %", "Durasi (detik)", "Tanggal"],
      ...rows.map((r) => [r.nama, r.username, r.group, r.ujian, r.skor, r.maks, r.persen, r.durasi, r.tanggal]),
    ];
    exportSheet(`rekap-hasil-${Date.now()}.xlsx`, [{ name: "Rekap", aoa }]);
  }

  return (
    <div className="space-y-4">
      <div>
        <Link to="/admin/laporan" className="text-sm text-muted-foreground hover:underline">
          ← Laporan
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Rekap Hasil Ujian</h1>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-5">
          <div>
            <label className="text-xs">Ujian</label>
            <Select value={ujianId} onValueChange={setUjianId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua ujian</SelectItem>
                {ujians.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs">Group</label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua group</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs">Dari tanggal</label>
            <Input type="date" value={dari} onChange={(e) => setDari(e.target.value)} />
          </div>
          <div>
            <label className="text-xs">Sampai tanggal</label>
            <Input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={exportExcel} disabled={rows.length === 0} className="w-full">
              <Download className="mr-1 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left">
              <tr>
                <th className="p-3">Nama</th>
                <th className="p-3">Group</th>
                <th className="p-3">Ujian</th>
                <th className="p-3">Skor</th>
                <th className="p-3">%</th>
                <th className="p-3">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="p-3">{r.nama}</td>
                  <td className="p-3">{r.group}</td>
                  <td className="p-3">{r.ujian}</td>
                  <td className="p-3 font-medium">
                    {r.skor} / {r.maks}
                  </td>
                  <td className="p-3">{r.persen}%</td>
                  <td className="p-3 text-xs">{r.tanggal}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    Tidak ada data sesuai filter.
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

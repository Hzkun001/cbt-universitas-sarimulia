import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { sesiRepo, ujianRepo, soalRepo } from "@/lib/cbt/repos";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { analisisButir, labelKesukaran, labelDiskriminasi } from "@/lib/cbt/analisis";
import { exportSheet, stripHtml } from "@/lib/cbt/excel";
import { RichView } from "@/components/cbt/RichEditor";

export const Route = createFileRoute("/_authenticated/admin/laporan/analisis")({
  component: AnalisisPage,
});

function AnalisisPage() {
  const ujians = ujianRepo.all();
  const [ujianId, setUjianId] = useState(ujians[0]?.id ?? "");

  const sesis = sesiRepo
    .all()
    .filter((s) => s.ujianId === ujianId && s.status === "selesai");
  const soals = soalRepo.all();
  const stats = analisisButir(sesis, soals);

  function exportExcel() {
    const aoa: (string | number)[][] = [
      [
        "No",
        "Soal",
        "Tipe",
        "Mengerjakan",
        "Benar",
        "Tingkat Kesukaran",
        "Label TK",
        "Indeks Diskriminasi",
        "Label DK",
      ],
      ...stats.map((s, i) => {
        const soal = soals.find((x) => x.id === s.soalId);
        return [
          i + 1,
          stripHtml(soal?.detail ?? "-").slice(0, 200),
          soal?.tipe ?? "-",
          s.jumlahMengerjakan,
          s.jumlahBenar,
          Math.round(s.tingkatKesukaran * 1000) / 10 + "%",
          labelKesukaran(s.tingkatKesukaran),
          Math.round(s.indeksDiskriminasi * 100) / 100,
          labelDiskriminasi(s.indeksDiskriminasi),
        ];
      }),
    ];
    exportSheet(`analisis-butir-${Date.now()}.xlsx`, [{ name: "Analisis", aoa }]);
  }

  return (
    <div className="space-y-4">
      <div>
        <Link to="/admin/laporan" className="text-sm text-muted-foreground hover:underline">
          ← Laporan
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Analisis Butir Soal</h1>
        <p className="text-sm text-muted-foreground">
          Tingkat kesukaran, indeks diskriminasi (upper-lower 27%), dan daya pengecoh per opsi.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-[260px]">
            <label className="text-xs">Paket ujian</label>
            <Select value={ujianId} onValueChange={setUjianId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ujians.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={exportExcel} disabled={stats.length === 0}>
            <Download className="mr-1 h-4 w-4" />
            Export Excel
          </Button>
          <span className="text-xs text-muted-foreground">
            {sesis.length} sesi selesai · {stats.length} soal dianalisis
          </span>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {stats.map((s, i) => {
          const soal = soals.find((x) => x.id === s.soalId);
          return (
            <Card key={s.soalId}>
              <CardContent className="space-y-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-muted-foreground">
                    #{i + 1} · {soal?.tipe}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span>
                      TK:{" "}
                      <strong>{Math.round(s.tingkatKesukaran * 1000) / 10}%</strong>{" "}
                      <span className="rounded bg-muted px-1.5 py-0.5">
                        {labelKesukaran(s.tingkatKesukaran)}
                      </span>
                    </span>
                    <span>
                      DK: <strong>{Math.round(s.indeksDiskriminasi * 100) / 100}</strong>{" "}
                      <span className="rounded bg-muted px-1.5 py-0.5">
                        {labelDiskriminasi(s.indeksDiskriminasi)}
                      </span>
                    </span>
                    <span>
                      {s.jumlahBenar} / {s.jumlahMengerjakan} benar
                    </span>
                  </div>
                </div>
                {soal && <RichView html={soal.detail} />}
                {soal && soal.tipe !== "essay" && (
                  <div className="grid grid-cols-2 gap-1 text-xs sm:grid-cols-4">
                    {soal.jawaban.map((o, idx) => (
                      <div
                        key={o.id}
                        className={`rounded border p-1.5 ${o.benar ? "bg-success/10 border-success/30" : ""}`}
                      >
                        <span className="font-mono">{String.fromCharCode(65 + idx)}</span>{" "}
                        dipilih: <strong>{s.dayaPengecoh[o.id] ?? 0}</strong>
                        {o.benar && <span className="ml-1 text-success">✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {stats.length === 0 && (
          <div className="rounded border-2 border-dashed p-8 text-center text-muted-foreground">
            Belum ada sesi selesai untuk dianalisis.
          </div>
        )}
      </div>
    </div>
  );
}

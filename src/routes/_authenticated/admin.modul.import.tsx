import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { soalRepo } from "@/lib/cbt/repos";
import { uid } from "@/lib/cbt/storage";
import type { Soal, Jawaban, TipeSoal, Kesulitan } from "@/lib/cbt/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Check, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/cbt/auth-store";
import { isTopikAllowed, visibleModuls, visibleTopiks } from "@/lib/cbt/access";

export const Route = createFileRoute("/_authenticated/admin/modul/import")({
  component: ImportPage,
});

type PreviewRow = { soal: Soal; valid: boolean; error?: string };

function ImportPage() {
  const user = useAuthStore((s) => s.user);
  const moduls = visibleModuls(user);
  const [modulId, setModulId] = useState<string>(moduls[0]?.id ?? "");
  const topiks = visibleTopiks(user).filter((t) => t.modulId === modulId);
  const [topikId, setTopikId] = useState<string>(topiks[0]?.id ?? "");
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  if (moduls.length === 0 || topiks.length === 0) {
    return (
      <div className="space-y-4 max-w-5xl">
        <div>
          <Link to="/admin/modul" className="text-sm text-muted-foreground hover:underline">
            ← Modul
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Import Soal dari Excel</h1>
        </div>
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="rounded-md border bg-muted/30 p-4 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <Lock className="h-4 w-4" />
                Tidak ada topik yang dapat Anda importi.
              </div>
              <p className="mt-1 text-muted-foreground">
                Operator dengan cakupan topik terbatas hanya dapat import soal ke topik yang
                termasuk dalam <code>allowedTopikIds</code>. Minta admin untuk menambah akses jika
                diperlukan.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function downloadTemplate() {
    const ws = XLSX.utils.json_to_sheet([
      {
        tipe: "pg",
        kesulitan: "mudah",
        pertanyaan: "2+2 = ?",
        opsi_a: "3",
        opsi_b: "4",
        opsi_c: "5",
        opsi_d: "6",
        benar: "B",
      },
      {
        tipe: "pg",
        kesulitan: "sedang",
        pertanyaan: "Ibukota Indonesia?",
        opsi_a: "Bandung",
        opsi_b: "Jakarta",
        opsi_c: "Medan",
        opsi_d: "Surabaya",
        benar: "B",
      },
      { tipe: "bs", kesulitan: "mudah", pertanyaan: "Matahari terbit di barat.", benar: "Salah" },
      { tipe: "essay", kesulitan: "sulit", pertanyaan: "Jelaskan fotosintesis dalam 2 paragraf." },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "soal");
    XLSX.writeFile(wb, "template-soal.xlsx");
  }

  async function loadFile(file: File) {
    if (!topikId) {
      toast.error("Pilih topik dulu");
      return;
    }
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const out: PreviewRow[] = [];
    for (const r of rows) {
      const tipe = String(r.tipe ?? "pg").toLowerCase() as TipeSoal;
      const kesulitan = String(r.kesulitan ?? "sedang").toLowerCase() as Kesulitan;
      const pertanyaan = String(r.pertanyaan ?? r.soal ?? "").trim();
      if (!pertanyaan) {
        out.push({ valid: false, error: "Pertanyaan kosong", soal: {} as Soal });
        continue;
      }
      if (!["pg", "multi", "bs", "essay"].includes(tipe)) {
        out.push({ valid: false, error: `Tipe tidak valid: ${tipe}`, soal: {} as Soal });
        continue;
      }
      if (!["mudah", "sedang", "sulit"].includes(kesulitan)) {
        out.push({ valid: false, error: `Kesulitan tidak valid`, soal: {} as Soal });
        continue;
      }

      let jawaban: Jawaban[] = [];
      let error: string | undefined;
      if (tipe === "essay") jawaban = [];
      else if (tipe === "bs") {
        const benar = String(r.benar ?? "")
          .toLowerCase()
          .startsWith("b");
        jawaban = [
          { id: uid("j_"), detail: "Benar", benar },
          { id: uid("j_"), detail: "Salah", benar: !benar },
        ];
      } else {
        const opts: string[] = [];
        for (const k of ["opsi_a", "opsi_b", "opsi_c", "opsi_d", "opsi_e", "opsi_f"]) {
          const v = String(r[k] ?? "").trim();
          if (v) opts.push(v);
        }
        if (opts.length < 2) {
          error = "Minimal 2 opsi";
        }
        const benarStr = String(r.benar ?? "")
          .toUpperCase()
          .trim();
        const benarIdx =
          tipe === "multi"
            ? benarStr
                .split(/[,\s]+/)
                .map((c) => c.charCodeAt(0) - 65)
                .filter((i) => i >= 0 && i < opts.length)
            : [benarStr.charCodeAt(0) - 65];
        if (!benarIdx.length || benarIdx.some((i) => i < 0 || i >= opts.length))
          error = "Kolom 'benar' tidak valid";
        jawaban = opts.map((o, i) => ({ id: uid("j_"), detail: o, benar: benarIdx.includes(i) }));
      }

      const soal: Soal = {
        id: uid("s_"),
        topikId,
        detail: pertanyaan,
        tipe,
        kesulitan,
        audioPlayOnce: false,
        jawaban,
        pembahasan: "",
        createdAt: Date.now(),
      };
      out.push({ soal, valid: !error, error });
    }
    setPreview(out);
  }

  function commit() {
    if (!topikId || !isTopikAllowed(user, topikId)) {
      toast.error("Topik tujuan di luar cakupan Anda");
      return;
    }
    const valid = preview.filter((r) => r.valid);
    valid.forEach((r) => soalRepo.upsert(r.soal));
    toast.success(`${valid.length} soal disimpan`);
    setPreview([]);
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <Link to="/admin/modul" className="text-sm text-muted-foreground hover:underline">
          ← Modul
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Import Soal dari Excel</h1>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Modul tujuan</label>
              <Select
                value={modulId}
                onValueChange={(v) => {
                  setModulId(v);
                  const ts = visibleTopiks(user).filter((t) => t.modulId === v);
                  setTopikId(ts[0]?.id ?? "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih modul" />
                </SelectTrigger>
                <SelectContent>
                  {moduls.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Topik tujuan</label>
              <Select value={topikId} onValueChange={setTopikId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih topik" />
                </SelectTrigger>
                <SelectContent>
                  {topiks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadTemplate}>
              Download Template Excel
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) loadFile(f);
                e.target.value = "";
              }}
            />
            <Button onClick={() => fileRef.current?.click()}>
              <Upload className="mr-1 h-4 w-4" />
              Pilih File
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Kolom: <code>tipe</code> (pg/multi/bs/essay), <code>kesulitan</code>{" "}
            (mudah/sedang/sulit), <code>pertanyaan</code>, <code>opsi_a</code>…<code>opsi_f</code>,{" "}
            <code>benar</code> (huruf opsi, mis. "B" atau untuk multi "A,C"). Untuk B-S:{" "}
            <code>benar</code> = "Benar" atau "Salah".
          </p>
        </CardContent>
      </Card>

      {preview.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b p-3">
              <p className="text-sm">
                Preview {preview.length} baris · {preview.filter((r) => r.valid).length} valid ·{" "}
                {preview.filter((r) => !r.valid).length} error
              </p>
              <Button size="sm" onClick={commit} disabled={!preview.some((r) => r.valid)}>
                <Check className="mr-1 h-4 w-4" />
                Simpan yang valid
              </Button>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">Pertanyaan</th>
                  <th className="p-2">Tipe</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2 max-w-md truncate">{r.soal?.detail ?? "-"}</td>
                    <td className="p-2">{r.soal?.tipe ?? "-"}</td>
                    <td className="p-2">
                      {r.valid ? (
                        <span className="text-success">✓ OK</span>
                      ) : (
                        <span className="text-destructive">✗ {r.error}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

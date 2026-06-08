// Pemeriksaan otomatis: pastikan route admin yang dirujuk sidebar terdaftar
// di src/routeTree.gen.ts sehingga tidak mengakibatkan 404.
import { readFileSync } from "node:fs";

const REQUIRED = [
  "/_authenticated/admin/laporan",
  "/_authenticated/admin/laporan/rekap",
  "/_authenticated/admin/laporan/analisis",
  "/_authenticated/admin/pengaturan",
  "/_authenticated/admin/tools",
  "/_authenticated/admin/files",
  "/_authenticated/admin/leaderboard/",
  "/_authenticated/admin/leaderboard/$id",
  "/_authenticated/admin/hasil",
  "/_authenticated/admin/users",
  "/_authenticated/admin/users/roles",
  "/_authenticated/admin/peserta",
  "/_authenticated/admin/peserta/online",
  "/_authenticated/admin/modul",
  "/_authenticated/admin/modul/import",
  "/_authenticated/admin/modul/import-word",
  "/_authenticated/admin/ujian",
  "/_authenticated/admin/ujian/$id/token",
  "/_authenticated/admin/ujian/$id/peserta",
  "/_authenticated/admin/evaluasi",
  "/_authenticated/admin/evaluasi/$id",
];

const tree = readFileSync("src/routeTree.gen.ts", "utf8");
const missing = REQUIRED.filter((r) => !tree.includes(`'${r}'`));

if (missing.length) {
  console.error("❌ Route admin tidak terdaftar (akan 404):");
  for (const m of missing) console.error("  -", m);
  process.exit(1);
}
console.log(`✅ Semua ${REQUIRED.length} route admin terdaftar.`);

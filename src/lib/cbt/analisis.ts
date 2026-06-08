// Analisis butir soal — pure functions
import type { SesiUjian, Soal } from "./types";

export type ButirSoalStat = {
  soalId: string;
  jumlahMengerjakan: number;
  jumlahBenar: number;
  tingkatKesukaran: number; // 0..1 (proporsi benar)
  indeksDiskriminasi: number; // -1..1
  dayaPengecoh: Record<string, number>; // optionId -> jumlah dipilih
};

function isCorrect(j: { jawabanIds: string[] }, soal: Soal): boolean {
  if (soal.tipe === "essay") return false;
  const benar = soal.jawaban.filter((x) => x.benar).map((x) => x.id);
  if (benar.length === 0 || j.jawabanIds.length === 0) return false;
  return (
    benar.length === j.jawabanIds.length &&
    benar.every((id) => j.jawabanIds.includes(id))
  );
}

export function analisisButir(
  sesisSelesai: SesiUjian[],
  soals: Soal[],
): ButirSoalStat[] {
  const soalMap = new Map(soals.map((s) => [s.id, s]));
  // urutkan sesi berdasarkan skorTotal desc untuk diskriminasi
  const sorted = [...sesisSelesai].sort(
    (a, b) => (b.skorTotal ?? 0) - (a.skorTotal ?? 0),
  );
  const N = sorted.length;
  const cut = Math.max(1, Math.round(N * 0.27));
  const upper = sorted.slice(0, cut);
  const lower = sorted.slice(N - cut);

  const out: ButirSoalStat[] = [];
  // ambil semua soalId yang muncul di sesi
  const soalIds = new Set<string>();
  sesisSelesai.forEach((s) => s.jawaban.forEach((j) => soalIds.add(j.soalId)));

  for (const sid of soalIds) {
    const soal = soalMap.get(sid);
    if (!soal) continue;

    let benarCount = 0;
    let totalCount = 0;
    const dayaPengecoh: Record<string, number> = {};
    soal.jawaban.forEach((o) => (dayaPengecoh[o.id] = 0));

    for (const sesi of sesisSelesai) {
      const j = sesi.jawaban.find((x) => x.soalId === sid);
      if (!j) continue;
      totalCount++;
      if (isCorrect(j, soal)) benarCount++;
      j.jawabanIds.forEach((oid) => {
        dayaPengecoh[oid] = (dayaPengecoh[oid] ?? 0) + 1;
      });
    }

    const upperBenar = upper.filter((sesi) => {
      const j = sesi.jawaban.find((x) => x.soalId === sid);
      return j ? isCorrect(j, soal) : false;
    }).length;
    const lowerBenar = lower.filter((sesi) => {
      const j = sesi.jawaban.find((x) => x.soalId === sid);
      return j ? isCorrect(j, soal) : false;
    }).length;

    const indeksDiskriminasi = cut > 0 ? (upperBenar - lowerBenar) / cut : 0;
    const tingkatKesukaran = totalCount > 0 ? benarCount / totalCount : 0;

    out.push({
      soalId: sid,
      jumlahMengerjakan: totalCount,
      jumlahBenar: benarCount,
      tingkatKesukaran,
      indeksDiskriminasi,
      dayaPengecoh,
    });
  }

  return out;
}

export function labelKesukaran(p: number): string {
  if (p < 0.3) return "Sulit";
  if (p > 0.7) return "Mudah";
  return "Sedang";
}

export function labelDiskriminasi(d: number): string {
  if (d < 0.2) return "Jelek";
  if (d < 0.4) return "Cukup";
  if (d < 0.7) return "Baik";
  return "Sangat Baik";
}

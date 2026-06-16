import type { Ujian } from "./types";

export type ExamAvailability = "upcoming" | "active" | "ended" | "open";

/**
 * Cek apakah ujian sedang dalam window waktu yang diizinkan.
 * - Jika `beginAt` dan `endAt` keduanya kosong → open (selalu tersedia).
 * - Jika hanya `beginAt` yang ada → aktif ketika `now >= beginAt`.
 * - Jika hanya `endAt` yang ada → aktif ketika `now <= endAt`.
 * - Jika keduanya ada → aktif ketika `beginAt <= now <= endAt`.
 * - Ujian dengan `endAt` di masa lalu dianggap sudah berakhir.
 */
export function isExamAvailable(
  ujian: Pick<Ujian, "beginAt" | "endAt">,
  now: number = Date.now(),
): boolean {
  const status = getExamAvailabilityStatus(ujian, now);
  return status === "active" || status === "open";
}

/**
 * Status ketersediaan ujian:
 * - "open": tidak ada window yang dikonfigurasi (selalu aktif).
 * - "upcoming": `beginAt` di masa depan.
 * - "active": sekarang berada di dalam window.
 * - "ended": `endAt` sudah terlewat.
 */
export function getExamAvailabilityStatus(
  ujian: Pick<Ujian, "beginAt" | "endAt">,
  now: number = Date.now(),
): ExamAvailability {
  const { beginAt, endAt } = ujian;

  if (beginAt === undefined && endAt === undefined) return "open";
  if (beginAt !== undefined && now < beginAt) return "upcoming";
  if (endAt !== undefined && now > endAt) return "ended";
  return "active";
}

export function getExamAvailabilityMessage(
  status: ExamAvailability,
  ujian: Pick<Ujian, "beginAt" | "endAt">,
  locale: "id" | "en" = "id",
): string {
  if (locale === "en") {
    switch (status) {
      case "upcoming":
        return `This exam opens on ${ujian.beginAt ? new Date(ujian.beginAt).toLocaleString() : ""}.`;
      case "ended":
        return `This exam closed on ${ujian.endAt ? new Date(ujian.endAt).toLocaleString() : ""}.`;
      case "open":
      case "active":
        return "";
    }
  }

  switch (status) {
    case "upcoming":
      return `Ujian belum dimulai. Dibuka pada ${ujian.beginAt ? new Date(ujian.beginAt).toLocaleString("id-ID") : ""}.`;
    case "ended":
      return `Ujian sudah berakhir pada ${ujian.endAt ? new Date(ujian.endAt).toLocaleString("id-ID") : ""}.`;
    case "open":
    case "active":
      return "";
  }
}

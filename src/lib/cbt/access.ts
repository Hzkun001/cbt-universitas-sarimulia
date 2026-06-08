// Helpers untuk membatasi akses berdasarkan `allowedTopikIds` user
// - admin selalu boleh akses semua
// - operator: dibatasi ke topik yang ada dalam `allowedTopikIds`
//   (kosong = boleh akses semua, sesuai UI di /admin/users/roles)
// - peserta: tidak relevan (mereka mengikuti ujian, bukan kelola)

import type { User, Ujian } from "./types";
import { topikRepo, soalRepo, modulRepo, ujianRepo } from "./repos";

export function isUnrestricted(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role === "operator" && (user.allowedTopikIds?.length ?? 0) === 0) return true;
  return false;
}

export function allowedTopikIdSet(user: User | null | undefined): Set<string> | null {
  if (isUnrestricted(user)) return null; // null = tanpa batasan
  return new Set(user?.allowedTopikIds ?? []);
}

export function isTopikAllowed(user: User | null | undefined, topikId: string): boolean {
  const set = allowedTopikIdSet(user);
  if (!set) return true;
  return set.has(topikId);
}

export function visibleTopiks(user: User | null | undefined) {
  const set = allowedTopikIdSet(user);
  const all = topikRepo.all();
  return set ? all.filter((t) => set.has(t.id)) : all;
}

export function visibleSoals(user: User | null | undefined) {
  const set = allowedTopikIdSet(user);
  const all = soalRepo.all();
  return set ? all.filter((s) => set.has(s.topikId)) : all;
}

export function visibleModuls(user: User | null | undefined) {
  const set = allowedTopikIdSet(user);
  const all = modulRepo.all();
  if (!set) return all;
  const allowedModulIds = new Set(
    topikRepo.all().filter((t) => set.has(t.id)).map((t) => t.modulId),
  );
  return all.filter((m) => allowedModulIds.has(m.id));
}

// Ujian dianggap "visible" jika minimal satu topicSet menyentuh topik yang
// boleh diakses operator. Admin / operator tanpa pembatasan: semua.
export function ujianTouchesAllowed(user: User | null | undefined, ujian: Ujian): boolean {
  const set = allowedTopikIdSet(user);
  if (!set) return true;
  return ujian.topicSets.some((ts) => set.has(ts.topikId));
}

export function visibleUjians(user: User | null | undefined) {
  const set = allowedTopikIdSet(user);
  const all = ujianRepo.all();
  if (!set) return all;
  return all.filter((u) => u.topicSets.some((ts) => set.has(ts.topikId)));
}

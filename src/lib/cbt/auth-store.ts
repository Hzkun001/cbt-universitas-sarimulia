import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { hydrateRepos, usersRepo } from "./repos";
import { loginServer } from "@/lib/server/repos/functions";
import type { Role, User } from "./types";

type AuthState = {
  userId: string | null;
  user: User | null;
  hydrated: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string; role?: Role }>;
  logout: () => void;
  refresh: () => Promise<void>;
  setHydrated: () => void;
};

export function readPersistedAuthSnapshot(): Pick<AuthState, "userId" | "user"> {
  if (typeof window === "undefined") {
    return { userId: null, user: null };
  }

  const raw = window.localStorage.getItem("cbtman:auth");
  if (!raw) {
    return { userId: null, user: null };
  }

  try {
    const parsed = JSON.parse(raw) as {
      state?: Partial<Pick<AuthState, "userId" | "user">>;
    };

    return {
      userId: parsed.state?.userId ?? null,
      user: parsed.state?.user ?? null,
    };
  } catch {
    return { userId: null, user: null };
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      userId: null,
      user: null,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      login: async (username, password) => {
        await hydrateRepos();
        const res = await loginServer({ data: { username, password } });
        if (!res.ok) return res;
        set({ userId: res.user.id, user: res.user });
        return { ok: true, role: res.user.role };
      },
      logout: () => set({ userId: null, user: null }),
      refresh: async () => {
        const id = get().userId;
        if (!id) return;
        try {
          await hydrateRepos();
        } catch {
          // Snapshot gagal; tetap validasi aktif dari cache terakhir (lebih baik daripada skip).
        }
        const u = usersRepo.byId(id) ?? null;
        if (!u || !u.aktif) {
          // User hilang atau dinonaktifkan di server → logout.
          set({ userId: null, user: null });
          return;
        }
        set({ user: u, userId: u.id });
      },
    }),
    {
      name: "cbtman:auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (undefined as never),
      ),
      partialize: (s) => ({
        userId: s.userId,
        // Jangan persist passwordHash ke localStorage — hanya field non-sensitif untuk render/guard.
        user: s.user ? { ...s.user, passwordHash: "" } : null,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
        void state?.refresh();
      },
    },
  ),
);

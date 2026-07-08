import { createFileRoute, redirect } from "@tanstack/react-router";
import { validateSessionServer } from "@/lib/server/repos/functions";

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ search }) => {
    const { user } = await validateSessionServer();
    if (user) {
      throw redirect({ to: user.role === "peserta" ? "/peserta" : "/admin" });
    }
    throw redirect({
      to: "/",
      search: {
        login: true,
        redirect: (search as any).redirect,
      },
    });
  },
  component: () => null,
});

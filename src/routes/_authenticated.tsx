import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/cbt/auth-store";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: ({ location }) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      throw redirect({ to: "/login", search: { redirect: location.href } as never });
    }
    return { user };
  },
  component: () => <Outlet />,
});

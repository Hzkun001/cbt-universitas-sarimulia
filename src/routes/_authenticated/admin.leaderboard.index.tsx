import { createFileRoute, Link } from "@tanstack/react-router";
import { ujianRepo, sesiRepo } from "@/lib/cbt/repos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/leaderboard/")({
  component: LeaderboardIndex,
});

function LeaderboardIndex() {
  const ujian = ujianRepo.all();
  const sesi = sesiRepo.all();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link to="/admin" className="text-sm text-muted-foreground hover:underline">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Trophy className="h-6 w-6 text-warning" /> Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground">Pilih paket ujian untuk melihat peringkat.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paket Ujian</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ujian.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">Belum ada paket ujian.</div>
          ) : (
            <ul className="divide-y">
              {ujian.map((u) => {
                const n = sesi.filter((s) => s.ujianId === u.id && s.status === "selesai").length;
                return (
                  <li key={u.id}>
                    <Link
                      to="/admin/leaderboard/$id"
                      params={{ id: u.id }}
                      className="flex items-center justify-between p-4 hover:bg-muted/40"
                    >
                      <div>
                        <div className="font-medium">{u.nama}</div>
                        <div className="text-xs text-muted-foreground">{n} sesi selesai</div>
                      </div>
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

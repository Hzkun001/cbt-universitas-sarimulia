import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { modulRepo, topikRepo, soalRepo } from "@/lib/cbt/repos";
import { uid } from "@/lib/cbt/storage";
import type { Topik } from "@/lib/cbt/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ChevronRight, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/cbt/auth-store";
import { allowedTopikIdSet, isUnrestricted } from "@/lib/cbt/access";

export const Route = createFileRoute("/_authenticated/admin/modul/$id/topik")({
  component: TopikPage,
});

function TopikPage() {
  const { id: modulId } = useParams({ from: "/_authenticated/admin/modul/$id/topik" });
  const user = useAuthStore((s) => s.user);
  const canEdit = isUnrestricted(user);
  const allowedSet = allowedTopikIdSet(user);
  const modul = modulRepo.byId(modulId);
  const filterMine = (list: Topik[]) =>
    list.filter((t) => t.modulId === modulId && (!allowedSet || allowedSet.has(t.id)));
  const [topiks, setTopiks] = useState<Topik[]>(filterMine(topikRepo.all()));
  const [nama, setNama] = useState("");

  if (!modul) return <div>Modul tidak ditemukan. <Link to="/admin/modul" className="text-primary">Kembali</Link></div>;

  function add() {
    if (!canEdit) return;
    if (!nama.trim()) return;
    topikRepo.upsert({ id: uid("t_"), modulId, nama: nama.trim() });
    setNama(""); setTopiks(filterMine(topikRepo.all())); toast.success("Topik ditambahkan");
  }
  function remove(id: string) {
    if (!canEdit) return;
    if (soalRepo.all().some((s) => s.topikId === id)) { toast.error("Hapus soal di topik ini dulu"); return; }
    if (!confirm("Hapus topik?")) return;
    topikRepo.remove(id); setTopiks(filterMine(topikRepo.all()));
  }

  return (
    <div className="space-y-4">
      <div>
        <Link to="/admin/modul" className="text-sm text-muted-foreground hover:underline">← Modul</Link>
        <h1 className="text-2xl font-semibold tracking-tight">{modul.nama} — Topik</h1>
      </div>
      {canEdit ? (
        <div className="flex gap-2 max-w-md">
          <Input placeholder="Nama topik (mis. Aljabar)" value={nama} onChange={(e) => setNama(e.target.value)} />
          <Button onClick={add}><Plus className="mr-1 h-4 w-4" />Tambah</Button>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          Mode hanya-baca untuk topik di luar izin Anda.
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {topiks.map((t) => {
          const count = soalRepo.all().filter((s) => s.topikId === t.id).length;
          return (
            <Card key={t.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{t.nama}</h3>
                    <p className="text-xs text-muted-foreground">{count} soal</p>
                  </div>
                  {canEdit && (
                    <Button size="sm" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  )}
                </div>
                <Link to="/admin/topik/$id/soal" params={{ id: t.id }} className="mt-3 inline-flex items-center text-sm text-primary hover:underline">
                  Kelola soal <ChevronRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
        {topiks.length === 0 && <div className="text-muted-foreground">Belum ada topik.</div>}
      </div>
    </div>
  );
}

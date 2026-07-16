import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { fakultasRepo } from "@/lib/cbt/repos";
import { mutateFakultasServer } from "@/lib/server/akademik/functions";
import { uid } from "@/lib/cbt/storage";
import type { Fakultas } from "@/lib/cbt/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/admin/akademik/fakultas")({
  component: FakultasPage,
});

function FakultasPage() {
  const [items, setItems] = useState<Fakultas[]>(fakultasRepo.all());
  const [editing, setEditing] = useState<Fakultas | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: "", nama: "" });

  function handleAdd() {
    setForm({ id: uid("f_"), nama: "" });
    setEditing(null);
    setOpen(true);
  }

  function handleEdit(item: Fakultas) {
    setForm({ id: item.id, nama: item.nama });
    setEditing(item);
    setOpen(true);
  }

  async function handleRemove(id: string) {
    if (!confirm("Hapus fakultas ini?")) return;
    const res = await mutateFakultasServer({ data: { action: "remove", payload: { id } } });
    if (!res.ok) {
      toast.error(res.error || "Gagal menghapus");
      return;
    }
    fakultasRepo.remove(id);
    setItems(fakultasRepo.all());
    toast.success("Fakultas dihapus");
  }

  async function save() {
    if (!form.nama.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }
    const payload: Fakultas = { id: form.id, nama: form.nama.trim() };
    const res = await mutateFakultasServer({ data: { action: "upsert", payload } });
    if (!res.ok) {
      toast.error(res.error || "Gagal menyimpan");
      return;
    }
    fakultasRepo.upsert(payload);
    setItems(fakultasRepo.all());
    toast.success("Fakultas disimpan");
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Daftar Fakultas</h2>
        <Button onClick={handleAdd} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Tambah
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left">
              <tr>
                <th className="p-3">Nama Fakultas</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{item.nama}</td>
                  <td className="p-3 text-right space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleRemove(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={2} className="p-6 text-center text-muted-foreground">
                    Belum ada data fakultas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Fakultas" : "Tambah Fakultas"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Fakultas</Label>
              <Input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Mis: Fakultas Ilmu Komputer"
                onKeyDown={(e) => {
                  if (e.key === "Enter") save();
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={save}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { jurusanRepo, fakultasRepo } from "@/lib/cbt/repos";
import { mutateJurusanServer } from "@/lib/server/akademik/functions";
import { uid } from "@/lib/cbt/storage";
import type { Jurusan } from "@/lib/cbt/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/akademik/jurusan")({
  component: JurusanPage,
});

function JurusanPage() {
  const [items, setItems] = useState<Jurusan[]>(jurusanRepo.all());
  const fakultasList = fakultasRepo.all();
  
  const [editing, setEditing] = useState<Jurusan | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: "", nama: "", fakultasId: "" });

  function handleAdd() {
    setForm({ id: uid("j_"), nama: "", fakultasId: "" });
    setEditing(null);
    setOpen(true);
  }

  function handleEdit(item: Jurusan) {
    setForm({ id: item.id, nama: item.nama, fakultasId: item.fakultasId });
    setEditing(item);
    setOpen(true);
  }

  async function handleRemove(id: string) {
    if (!confirm("Hapus jurusan ini?")) return;
    const res = await mutateJurusanServer({ data: { action: "remove", payload: { id } } });
    if (!res.ok) {
      toast.error(res.error || "Gagal menghapus");
      return;
    }
    jurusanRepo.remove(id);
    setItems(jurusanRepo.all());
    toast.success("Jurusan dihapus");
  }

  async function save() {
    if (!form.nama.trim() || !form.fakultasId) {
      toast.error("Nama dan Fakultas wajib diisi");
      return;
    }
    const payload: Jurusan = { id: form.id, nama: form.nama.trim(), fakultasId: form.fakultasId };
    const res = await mutateJurusanServer({ data: { action: "upsert", payload } });
    if (!res.ok) {
      toast.error(res.error || "Gagal menyimpan");
      return;
    }
    jurusanRepo.upsert(payload);
    setItems(jurusanRepo.all());
    toast.success("Jurusan disimpan");
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Daftar Jurusan</h2>
        <Button onClick={handleAdd} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Tambah
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left">
              <tr>
                <th className="p-3">Nama Jurusan</th>
                <th className="p-3">Fakultas</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const fakultas = fakultasList.find((f) => f.id === item.fakultasId);
                return (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{item.nama}</td>
                    <td className="p-3">{fakultas?.nama ?? "-"}</td>
                    <td className="p-3 text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleRemove(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-muted-foreground">
                    Belum ada data jurusan.
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
            <DialogTitle>{editing ? "Edit Jurusan" : "Tambah Jurusan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Jurusan</Label>
              <Input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Mis: Teknik Informatika"
              />
            </div>
            <div className="space-y-2">
              <Label>Fakultas</Label>
              <Select value={form.fakultasId} onValueChange={(v) => setForm({ ...form, fakultasId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Fakultas" />
                </SelectTrigger>
                <SelectContent>
                  {fakultasList.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

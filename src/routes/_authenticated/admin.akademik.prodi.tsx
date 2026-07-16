import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { prodiRepo, jurusanRepo, fakultasRepo } from "@/lib/cbt/repos";
import { mutateProdiServer } from "@/lib/server/akademik/functions";
import { uid } from "@/lib/cbt/storage";
import type { ProgramStudi } from "@/lib/cbt/types";
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

export const Route = createFileRoute("/_authenticated/admin/akademik/prodi")({
  component: ProdiPage,
});

function ProdiPage() {
  const [items, setItems] = useState<ProgramStudi[]>(prodiRepo.all());
  const jurusanList = jurusanRepo.all();
  const fakultasList = fakultasRepo.all();
  
  const [editing, setEditing] = useState<ProgramStudi | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: "", nama: "", jurusanId: "" });

  function handleAdd() {
    setForm({ id: uid("p_"), nama: "", jurusanId: "" });
    setEditing(null);
    setOpen(true);
  }

  function handleEdit(item: ProgramStudi) {
    setForm({ id: item.id, nama: item.nama, jurusanId: item.jurusanId });
    setEditing(item);
    setOpen(true);
  }

  async function handleRemove(id: string) {
    if (!confirm("Hapus program studi ini?")) return;
    const res = await mutateProdiServer({ data: { action: "remove", payload: { id } } });
    if (!res.ok) {
      toast.error(res.error || "Gagal menghapus");
      return;
    }
    prodiRepo.remove(id);
    setItems(prodiRepo.all());
    toast.success("Program Studi dihapus");
  }

  async function save() {
    if (!form.nama.trim() || !form.jurusanId) {
      toast.error("Nama dan Jurusan wajib diisi");
      return;
    }
    const payload: ProgramStudi = { id: form.id, nama: form.nama.trim(), jurusanId: form.jurusanId };
    const res = await mutateProdiServer({ data: { action: "upsert", payload } });
    if (!res.ok) {
      toast.error(res.error || "Gagal menyimpan");
      return;
    }
    prodiRepo.upsert(payload);
    setItems(prodiRepo.all());
    toast.success("Program Studi disimpan");
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Daftar Program Studi</h2>
        <Button onClick={handleAdd} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Tambah
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left">
              <tr>
                <th className="p-3">Program Studi</th>
                <th className="p-3">Jurusan</th>
                <th className="p-3">Fakultas</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const jurusan = jurusanList.find((j) => j.id === item.jurusanId);
                const fakultas = fakultasList.find((f) => f.id === jurusan?.fakultasId);
                return (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{item.nama}</td>
                    <td className="p-3">{jurusan?.nama ?? "-"}</td>
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
                  <td colSpan={4} className="p-6 text-center text-muted-foreground">
                    Belum ada data program studi.
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
            <DialogTitle>{editing ? "Edit Program Studi" : "Tambah Program Studi"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Program Studi</Label>
              <Input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Mis: D4 Rekayasa Perangkat Lunak"
              />
            </div>
            <div className="space-y-2">
              <Label>Jurusan</Label>
              <Select value={form.jurusanId} onValueChange={(v) => setForm({ ...form, jurusanId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jurusan" />
                </SelectTrigger>
                <SelectContent>
                  {jurusanList.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.nama}
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

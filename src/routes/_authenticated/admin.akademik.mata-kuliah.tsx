import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { mataKuliahRepo, prodiRepo, semesterRepo, tahunAkademikRepo } from "@/lib/cbt/repos";
import { mutateMataKuliahServer } from "@/lib/server/akademik/functions";
import { uid } from "@/lib/cbt/storage";
import type { MataKuliah } from "@/lib/cbt/types";
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

export const Route = createFileRoute("/_authenticated/admin/akademik/mata-kuliah")({
  component: MataKuliahPage,
});

function MataKuliahPage() {
  const [items, setItems] = useState<MataKuliah[]>(mataKuliahRepo.all());
  const prodiList = prodiRepo.all();
  const semesterList = semesterRepo.all();
  const taList = tahunAkademikRepo.all();
  
  const [editing, setEditing] = useState<MataKuliah | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: "", kode: "", nama: "", sks: 2, prodiId: "", semesterId: "" });

  function handleAdd() {
    setForm({ id: uid("mk_"), kode: "", nama: "", sks: 2, prodiId: "", semesterId: "" });
    setEditing(null);
    setOpen(true);
  }

  function handleEdit(item: MataKuliah) {
    setForm({ id: item.id, kode: item.kode, nama: item.nama, sks: item.sks, prodiId: item.prodiId, semesterId: item.semesterId });
    setEditing(item);
    setOpen(true);
  }

  async function handleRemove(id: string) {
    if (!confirm("Hapus mata kuliah ini?")) return;
    const res = await mutateMataKuliahServer({ data: { action: "remove", payload: { id } } });
    if (!res.ok) {
      toast.error(res.error || "Gagal menghapus");
      return;
    }
    mataKuliahRepo.remove(id);
    setItems(mataKuliahRepo.all());
    toast.success("Mata Kuliah dihapus");
  }

  async function save() {
    if (!form.nama.trim() || !form.kode.trim() || !form.prodiId || !form.semesterId) {
      toast.error("Kode, Nama, Prodi, dan Semester wajib diisi");
      return;
    }
    const payload: MataKuliah = { 
      id: form.id, 
      kode: form.kode.trim(), 
      nama: form.nama.trim(), 
      sks: form.sks,
      prodiId: form.prodiId,
      semesterId: form.semesterId 
    };
    const res = await mutateMataKuliahServer({ data: { action: "upsert", payload } });
    if (!res.ok) {
      toast.error(res.error || "Gagal menyimpan");
      return;
    }
    mataKuliahRepo.upsert(payload);
    setItems(mataKuliahRepo.all());
    toast.success("Mata Kuliah disimpan");
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Daftar Mata Kuliah</h2>
        <Button onClick={handleAdd} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Tambah
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left">
              <tr>
                <th className="p-3">Kode</th>
                <th className="p-3">Mata Kuliah</th>
                <th className="p-3">SKS</th>
                <th className="p-3">Prodi</th>
                <th className="p-3">Semester</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const prodi = prodiList.find((p) => p.id === item.prodiId);
                const semester = semesterList.find((s) => s.id === item.semesterId);
                const ta = taList.find((t) => t.id === semester?.tahunAkademikId);
                return (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{item.kode}</td>
                    <td className="p-3">{item.nama}</td>
                    <td className="p-3">{item.sks}</td>
                    <td className="p-3">{prodi?.nama ?? "-"}</td>
                    <td className="p-3">
                      {semester?.nama ?? "-"} {ta ? `(${ta.nama})` : ""}
                    </td>
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
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    Belum ada data mata kuliah.
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
            <DialogTitle>{editing ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kode Mata Kuliah</Label>
                <Input
                  value={form.kode}
                  onChange={(e) => setForm({ ...form, kode: e.target.value })}
                  placeholder="Mis: IF101"
                />
              </div>
              <div className="space-y-2">
                <Label>SKS</Label>
                <Input
                  type="number"
                  min="1"
                  max="8"
                  value={form.sks}
                  onChange={(e) => setForm({ ...form, sks: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nama Mata Kuliah</Label>
              <Input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Mis: Algoritma Pemrograman"
              />
            </div>
            <div className="space-y-2">
              <Label>Program Studi</Label>
              <Select value={form.prodiId} onValueChange={(v) => setForm({ ...form, prodiId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Prodi" />
                </SelectTrigger>
                <SelectContent>
                  {prodiList.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={form.semesterId} onValueChange={(v) => setForm({ ...form, semesterId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesterList.map((s) => {
                    const ta = taList.find((t) => t.id === s.tahunAkademikId);
                    return (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nama} {ta ? `- ${ta.nama}` : ""}
                      </SelectItem>
                    );
                  })}
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

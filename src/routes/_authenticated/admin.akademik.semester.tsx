import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { semesterRepo, tahunAkademikRepo } from "@/lib/cbt/repos";
import { mutateSemesterServer } from "@/lib/server/akademik/functions";
import { uid } from "@/lib/cbt/storage";
import type { Semester } from "@/lib/cbt/types";
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

export const Route = createFileRoute("/_authenticated/admin/akademik/semester")({
  component: SemesterPage,
});

function SemesterPage() {
  const [items, setItems] = useState<Semester[]>(semesterRepo.all());
  const taList = tahunAkademikRepo.all();
  
  const [editing, setEditing] = useState<Semester | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: "", nama: "", tahunAkademikId: "" });

  function handleAdd() {
    const activeTA = taList.find((t) => t.aktif)?.id ?? "";
    setForm({ id: uid("smt_"), nama: "", tahunAkademikId: activeTA });
    setEditing(null);
    setOpen(true);
  }

  function handleEdit(item: Semester) {
    setForm({ id: item.id, nama: item.nama, tahunAkademikId: item.tahunAkademikId });
    setEditing(item);
    setOpen(true);
  }

  async function handleRemove(id: string) {
    if (!confirm("Hapus semester ini?")) return;
    const res = await mutateSemesterServer({ data: { action: "remove", payload: { id } } });
    if (!res.ok) {
      toast.error(res.error || "Gagal menghapus");
      return;
    }
    semesterRepo.remove(id);
    setItems(semesterRepo.all());
    toast.success("Semester dihapus");
  }

  async function save() {
    if (!form.nama.trim() || !form.tahunAkademikId) {
      toast.error("Nama dan Tahun Akademik wajib diisi");
      return;
    }
    const payload: Semester = { id: form.id, nama: form.nama.trim(), tahunAkademikId: form.tahunAkademikId };
    const res = await mutateSemesterServer({ data: { action: "upsert", payload } });
    if (!res.ok) {
      toast.error(res.error || "Gagal menyimpan");
      return;
    }
    semesterRepo.upsert(payload);
    setItems(semesterRepo.all());
    toast.success("Semester disimpan");
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Daftar Semester</h2>
        <Button onClick={handleAdd} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Tambah
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left">
              <tr>
                <th className="p-3">Semester</th>
                <th className="p-3">Tahun Akademik</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const ta = taList.find((t) => t.id === item.tahunAkademikId);
                return (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{item.nama}</td>
                    <td className="p-3">{ta?.nama ?? "-"}</td>
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
                    Belum ada data semester.
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
            <DialogTitle>{editing ? "Edit Semester" : "Tambah Semester"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Semester</Label>
              <Input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Mis: Ganjil"
              />
            </div>
            <div className="space-y-2">
              <Label>Tahun Akademik</Label>
              <Select value={form.tahunAkademikId} onValueChange={(v) => setForm({ ...form, tahunAkademikId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tahun Akademik" />
                </SelectTrigger>
                <SelectContent>
                  {taList.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nama} {t.aktif && "(Aktif)"}
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

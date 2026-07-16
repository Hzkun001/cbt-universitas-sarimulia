import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { tahunAkademikRepo } from "@/lib/cbt/repos";
import { mutateTahunAkademikServer } from "@/lib/server/akademik/functions";
import { uid } from "@/lib/cbt/storage";
import type { TahunAkademik } from "@/lib/cbt/types";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/akademik/tahun-akademik")({
  component: TahunAkademikPage,
});

function TahunAkademikPage() {
  const [items, setItems] = useState<TahunAkademik[]>(tahunAkademikRepo.all());
  
  const [editing, setEditing] = useState<TahunAkademik | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: "", nama: "", aktif: false });

  function handleAdd() {
    setForm({ id: uid("ta_"), nama: "", aktif: false });
    setEditing(null);
    setOpen(true);
  }

  function handleEdit(item: TahunAkademik) {
    setForm({ id: item.id, nama: item.nama, aktif: item.aktif });
    setEditing(item);
    setOpen(true);
  }

  async function handleRemove(id: string) {
    if (!confirm("Hapus tahun akademik ini?")) return;
    const res = await mutateTahunAkademikServer({ data: { action: "remove", payload: { id } } });
    if (!res.ok) {
      toast.error(res.error || "Gagal menghapus");
      return;
    }
    tahunAkademikRepo.remove(id);
    setItems(tahunAkademikRepo.all());
    toast.success("Tahun Akademik dihapus");
  }

  async function save() {
    if (!form.nama.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }
    const payload: TahunAkademik = { id: form.id, nama: form.nama.trim(), aktif: form.aktif };
    const res = await mutateTahunAkademikServer({ data: { action: "upsert", payload } });
    if (!res.ok) {
      toast.error(res.error || "Gagal menyimpan");
      return;
    }
    tahunAkademikRepo.upsert(payload);
    setItems(tahunAkademikRepo.all());
    toast.success("Tahun Akademik disimpan");
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Daftar Tahun Akademik</h2>
        <Button onClick={handleAdd} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Tambah
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left">
              <tr>
                <th className="p-3">Tahun Akademik</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{item.nama}</td>
                  <td className="p-3">
                    {item.aktif ? (
                      <Badge className="bg-green-500 hover:bg-green-600">Aktif</Badge>
                    ) : (
                      <Badge variant="secondary">Tidak Aktif</Badge>
                    )}
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
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-muted-foreground">
                    Belum ada data tahun akademik.
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
            <DialogTitle>{editing ? "Edit Tahun Akademik" : "Tambah Tahun Akademik"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Tahun Akademik</Label>
              <Input
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Mis: 2024/2025"
                onKeyDown={(e) => {
                  if (e.key === "Enter") save();
                }}
                autoFocus
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={form.aktif}
                onCheckedChange={(c) => setForm({ ...form, aktif: c })}
                id="aktif-mode"
              />
              <Label htmlFor="aktif-mode" className="font-normal">
                Tandai sebagai Tahun Akademik Aktif
              </Label>
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

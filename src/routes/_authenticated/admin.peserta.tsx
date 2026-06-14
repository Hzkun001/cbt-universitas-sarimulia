import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { usersRepo, groupsRepo } from "@/lib/cbt/repos";
import { hashPassword } from "@/lib/cbt/hash";
import { upsertUserServer } from "@/lib/server/repos/functions";
import { uid } from "@/lib/cbt/storage";
import type { Group, User } from "@/lib/cbt/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus, Printer, Upload, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/peserta")({
  component: PesertaPage,
});

type PesertaWithPwd = User & { _initialPassword?: string };

function PesertaPage() {
  const [peserta, setPeserta] = useState<PesertaWithPwd[]>(
    usersRepo.all().filter((u) => u.role === "peserta"),
  );
  const [groups, setGroups] = useState<Group[]>(groupsRepo.all());
  const [editing, setEditing] = useState<PesertaWithPwd | null>(null);
  const [open, setOpen] = useState(false);
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [query, setQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function refresh() {
    setPeserta(usersRepo.all().filter((u) => u.role === "peserta"));
    setGroups(groupsRepo.all());
  }

  const shown = peserta.filter((p) =>
    (filterGroup === "all" || p.groupId === filterGroup) &&
    (query === "" || p.namaLengkap.toLowerCase().includes(query.toLowerCase()) || p.username.toLowerCase().includes(query.toLowerCase())),
  );

  async function importExcel(file: File) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    let added = 0;
    for (const r of rows) {
      const username = String(r.username ?? r.Username ?? "").trim();
      const nama = String(r.nama ?? r.Nama ?? r.namaLengkap ?? "").trim();
      const password = String(r.password ?? r.Password ?? username + "123").trim();
      const groupName = String(r.group ?? r.Group ?? r.kelas ?? "").trim();
      if (!username || !nama) continue;
      let groupId: string | undefined;
      if (groupName) {
        let g = groupsRepo.all().find((x) => x.nama.toLowerCase() === groupName.toLowerCase());
        if (!g) { g = { id: uid("g_"), nama: groupName, keterangan: "" }; groupsRepo.upsert(g); }
        groupId = g.id;
      }
      const u: PesertaWithPwd = {
        id: uid("u_"), username, namaLengkap: nama, role: "peserta",
        allowedTopikIds: [], groupId, aktif: true,
        passwordHash: await hashPassword(password), createdAt: Date.now(),
        _initialPassword: password,
      };
      usersRepo.upsert(u);
      added++;
    }
    toast.success(`${added} peserta diimport`);
    refresh();
  }

  function downloadTemplate() {
    const ws = XLSX.utils.json_to_sheet([
      { username: "siswa10", nama: "Contoh Siswa", password: "siswa10123", group: "XII IPA 1" },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "peserta");
    XLSX.writeFile(wb, "template-peserta.xlsx");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Peserta</h1>
          <p className="text-sm text-muted-foreground">Kelola siswa & cetak kartu login.</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".xlsx,.xls" hidden onChange={(e) => {
            const f = e.target.files?.[0]; if (f) importExcel(f); e.target.value = "";
          }} />
          <Button variant="outline" onClick={downloadTemplate}>Template Excel</Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="mr-1 h-4 w-4" />Import Excel</Button>
          <Link to="/admin/peserta/group"><Button variant="outline"><UsersIcon className="mr-1 h-4 w-4" />Group</Button></Link>
          <Link to="/admin/peserta/kartu"><Button variant="outline"><Printer className="mr-1 h-4 w-4" />Cetak Kartu</Button></Link>
          <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="mr-1 h-4 w-4" />Tambah</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Cari nama atau username…" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-sm" />
        <Select value={filterGroup} onValueChange={setFilterGroup}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua group</SelectItem>
            {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.nama}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card><CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr><th className="p-3">Username</th><th className="p-3">Nama</th><th className="p-3">Group</th><th className="p-3">Aktif</th><th className="p-3 text-right">Aksi</th></tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3 font-mono text-xs">{p.username}</td>
                <td className="p-3">{p.namaLengkap}</td>
                <td className="p-3">{groups.find((g) => g.id === p.groupId)?.nama ?? "-"}</td>
                <td className="p-3">{p.aktif ? "Aktif" : "Nonaktif"}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    if (!confirm("Hapus peserta ini?")) return;
                    usersRepo.remove(p.id); refresh();
                  }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Tidak ada data.</td></tr>}
          </tbody>
        </table>
      </CardContent></Card>

      <PesertaDialog open={open} onOpenChange={setOpen} editing={editing} groups={groups} onSaved={refresh} />
    </div>
  );
}

function PesertaDialog({
  open,
  onOpenChange,
  editing,
  groups,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: User | null;
  groups: Group[];
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    username: "",
    namaLengkap: "",
    groupId: "",
    aktif: true,
    password: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      username: editing?.username ?? "",
      namaLengkap: editing?.namaLengkap ?? "",
      groupId: editing?.groupId ?? "",
      aktif: editing?.aktif ?? true,
      password: "",
    });
  }, [editing, open]);

  async function save() {
    if (!form.username.trim() || !form.namaLengkap.trim()) {
      toast.error("Wajib diisi");
      return;
    }

    const res = await upsertUserServer({
      data: {
        id: editing?.id ?? uid("u_"),
        username: form.username.trim(),
        namaLengkap: form.namaLengkap.trim(),
        role: "peserta",
        allowedTopikIds: editing?.allowedTopikIds ?? [],
        groupId: form.groupId || undefined,
        detail: editing?.detail,
        aktif: form.aktif,
        createdAt: editing?.createdAt ?? Date.now(),
        newPassword: form.password.trim() || undefined,
      },
    });

    if (!res.ok) {
      toast.error(res.error ?? "Gagal menyimpan peserta");
      return;
    }

    usersRepo.upsert(res.user);
    toast.success("Disimpan");
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Peserta" : "Peserta Baru"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Username</Label>
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div>
            <Label>Nama lengkap</Label>
            <Input
              value={form.namaLengkap}
              onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })}
            />
          </div>
          <div>
            <Label>Group</Label>
            <Select value={form.groupId} onValueChange={(v) => setForm({ ...form, groupId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="(tanpa group)" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{editing ? "Password baru (opsional)" : "Password"}</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={save}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

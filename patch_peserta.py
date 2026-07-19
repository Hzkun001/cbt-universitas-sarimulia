import re

with open('src/routes/_authenticated/admin.peserta.index.tsx', 'r') as f:
    content = f.read()

if 'AdminPage' not in content:
    content = content.replace('import { Card, CardContent } from "@/components/ui/card";',
                              'import { Card, CardContent } from "@/components/ui/card";\nimport { AdminPage, AdminPageHeader, AdminPageContent } from "@/components/cbt/AdminPage";')

replacement = """    <AdminPage>
      <AdminPageHeader
        title="Akun Peserta"
        description="Kelola data mahasiswa, grup kelas, dan import akun dari Excel."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <input id="file-upload" type="file" accept=".xlsx,.xls" hidden onChange={(e) => {
              const f = e.target.files?.[0]; if (f) importExcel(f); e.target.value = "";
            }} />
            <Button variant="outline" size="sm" onClick={() => document.getElementById("file-upload")?.click()} className="h-9">
              <Upload className="mr-2 h-4 w-4" /> Import Excel
            </Button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <Link to="/admin/peserta/group">
              <Button variant="outline" size="sm" className="h-9">
                <UsersIcon className="mr-2 h-4 w-4" /> Grup Kelas
              </Button>
            </Link>
            <Link to="/admin/peserta/kartu">
              <Button variant="outline" size="sm" className="h-9">
                <Printer className="mr-2 h-4 w-4" /> Cetak Kartu
              </Button>
            </Link>
            <Button onClick={() => { setEditing(null); setOpen(true); }} size="sm" className="h-9">
              <Plus className="mr-2 h-4 w-4" /> Tambah Peserta
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input 
          placeholder="Cari nama atau username..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="max-w-xs" 
        />
        <Select value={filterGroup} onValueChange={setFilterGroup}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Semua Grup" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Grup</SelectItem>
            {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.nama}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* List Section */}
      <AdminPageContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-semibold">
              <tr>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-left border-r border-slate-200 dark:border-slate-800">Username</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-left border-r border-slate-200 dark:border-slate-800">Nama Lengkap</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center border-r border-slate-200 dark:border-slate-800">Grup / Kelas</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center border-r border-slate-200 dark:border-slate-800">Status</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-medium text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 text-left">{p.username}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 text-left">{p.namaLengkap}</td>
                  <td className="p-4 text-center border-r border-slate-200 dark:border-slate-800">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {groups.find((g) => g.id === p.groupId)?.nama ?? "-"}
                    </span>
                  </td>
                  <td className="p-4 text-center border-r border-slate-200 dark:border-slate-800">
                    {p.aktif ? (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Aktif</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">Nonaktif</span>
                    )}
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditing(p); setOpen(true); }} className="h-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-destructive hover:bg-destructive/10" onClick={() => {
                      if (confirm("Hapus peserta ini?")) {
                        usersRepo.remove(p.id);
                        refresh();
                      }
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Tidak ada data peserta yang sesuai.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminPageContent>
"""

# Find exactly what's currently in the file from <div className="mx-auto max-w-5xl space-y-6"> down to right before <PesertaDialog open={open}...
start_pattern = r'<div className="mx-auto max-w-5xl space-y-6">.*?<PesertaDialog open=\{open\}'
# We replace it with replacement + "\n      <PesertaDialog open={open}"
# Note: we also have to replace the closing </div> of <div className="mx-auto max-w-5xl space-y-6"> which is AFTER <PesertaDialog>.
# Wait, let's just replace the whole return block safely using regex.
block_pattern = r'<div className="mx-auto max-w-5xl space-y-6">.*?</div>\s*<PesertaDialog'

# Actually, the file ends like this:
'''
      <PesertaDialog open={open} onOpenChange={setOpen} editing={editing} groups={groups} onSaved={refresh} />
    </div>
  );
}
'''

new_content = re.sub(
    r'<div className="mx-auto max-w-5xl space-y-6">.*?(?=<PesertaDialog)', 
    replacement, 
    content, 
    flags=re.DOTALL
)

new_content = re.sub(
    r'<PesertaDialog(.*?)\s*</div>\s*\);\s*\}',
    r'<PesertaDialog\1\n    </AdminPage>\n  );\n}',
    new_content,
    flags=re.DOTALL
)

with open('src/routes/_authenticated/admin.peserta.index.tsx', 'w') as f:
    f.write(new_content)


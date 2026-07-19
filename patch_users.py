import re

with open('src/routes/_authenticated/admin.users.tsx', 'r') as f:
    content = f.read()

replacement = """      <AdminPageContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-semibold">
              <tr>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-left border-r border-slate-200 dark:border-slate-800">Username</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-left border-r border-slate-200 dark:border-slate-800">Nama Lengkap</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center border-r border-slate-200 dark:border-slate-800">Peran</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center border-r border-slate-200 dark:border-slate-800">Status</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-medium text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 text-left">{u.username}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 text-left">{u.namaLengkap}</td>
                  <td className="p-4 text-center border-r border-slate-200 dark:border-slate-800">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {u.role === "super_admin" ? "Super Admin" : u.role === "admin_prodi" ? "Admin Prodi" : u.role === "evaluator" ? "Evaluator" : u.role}
                    </span>
                  </td>
                  <td className="p-4 text-center border-r border-slate-200 dark:border-slate-800">
                    {u.aktif ? (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-success/15 text-success">Aktif</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-destructive/15 text-destructive">Nonaktif</span>
                    )}
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditing(u); setOpen(true); }} className="h-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-destructive hover:bg-destructive/10" onClick={() => {
                      if (confirm("Hapus pengguna ini?")) {
                        usersRepo.remove(u.id);
                        refresh();
                      }
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950" onClick={async () => {
                      if (!confirm("Hentikan semua sesi aktif pengguna ini? (Force logout)")) return;
                      try {
                        const res = await revokeUserSessionsServer({ data: { userId: u.id } });
                        if (res.ok) toast.success("Sesi berhasil dihentikan. Pengguna akan ter-logout.");
                        else toast.error(res.error ?? "Gagal menghentikan sesi");
                      } catch {
                        toast.error("Gagal menghentikan sesi");
                      }
                    }}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Tidak ada data pengguna.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminPageContent>"""

start_idx = content.find('<AdminPageContent>')
end_idx = content.find('</AdminPageContent>') + len('</AdminPageContent>')

new_content = content[:start_idx] + replacement + content[end_idx:]

with open('src/routes/_authenticated/admin.users.tsx', 'w') as f:
    f.write(new_content)

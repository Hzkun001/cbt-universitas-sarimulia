import re

with open('src/routes/_authenticated/admin.modul.tsx', 'r') as f:
    content = f.read()

replacement = """      <AdminPageContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-semibold">
              <tr>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-left border-r border-slate-200 dark:border-slate-800">Nama Modul</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-left border-r border-slate-200 dark:border-slate-800">Mata Kuliah</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center border-r border-slate-200 dark:border-slate-800">Topik</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center border-r border-slate-200 dark:border-slate-800">Soal</th>
                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((m) => {
                const tAll = topikRepo.all().filter((t) => t.modulId === m.id);
                const t = allowedSet ? tAll.filter((x) => allowedSet.has(x.id)) : tAll;
                const tIds = new Set(t.map((x) => x.id));
                const sCount = soalRepo.all().filter((s) => tIds.has(s.topikId)).length;
                const mkName = m.mataKuliahId ? mkList.find((x) => x.id === m.mataKuliahId)?.nama : null;

                return (
                  <tr key={m.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">
                      <Link to="/admin/modul/$id/topik" params={{ id: m.id }} className="hover:text-primary transition-colors">
                        {m.nama}
                      </Link>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">
                      {mkName ? (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {mkName}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center border-r border-slate-200 dark:border-slate-800">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{t.length}</span>
                    </td>
                    <td className="p-4 text-center border-r border-slate-200 dark:border-slate-800">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{sCount}</span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <Button size="sm" variant="outline" className="h-8 shadow-sm" asChild>
                        <Link to="/admin/modul/$id/topik" params={{ id: m.id }}>
                          Kelola Topik
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 shadow-sm bg-white dark:bg-slate-900" onClick={() => exportBank(m)} title="Export JSON">
                        <Download className="h-4 w-4" />
                      </Button>
                      {canEdit && (
                        <Button size="sm" variant="ghost" className="h-8 text-destructive hover:bg-destructive/10" onClick={() => remove(m.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Belum ada modul bank soal.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminPageContent>"""

new_content = re.sub(
    r'<AdminPageContent>.*?</AdminPageContent>', 
    replacement, 
    content, 
    flags=re.DOTALL
)

with open('src/routes/_authenticated/admin.modul.tsx', 'w') as f:
    f.write(new_content)


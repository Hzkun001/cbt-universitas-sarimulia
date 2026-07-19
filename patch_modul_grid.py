import re

with open('src/routes/_authenticated/admin.modul.tsx', 'r') as f:
    content = f.read()

replacement = """      <AdminPageContent className="bg-transparent border-0 p-0 shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((m) => {
            const tAll = topikRepo.all().filter((t) => t.modulId === m.id);
            const t = allowedSet ? tAll.filter((x) => allowedSet.has(x.id)) : tAll;
            const tIds = new Set(t.map((x) => x.id));
            const sCount = soalRepo.all().filter((s) => tIds.has(s.topikId)).length;
            const mkName = m.mataKuliahId ? mkList.find((x) => x.id === m.mataKuliahId)?.nama : null;

            return (
              <div key={m.id} className="group relative flex flex-col justify-between p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-md transition-all gap-4 overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2 pt-1">
                    <Link to="/admin/modul/$id/topik" params={{ id: m.id }} className="text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 after:absolute after:inset-0">
                      {m.nama}
                    </Link>
                    {mkName && (
                      <div className="relative z-10">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold tracking-wide uppercase text-slate-500">
                          {mkName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-400"/> {t.length} Topik</span>
                    <span className="flex items-center gap-1.5"><ChevronRight className="w-4 h-4 text-slate-400"/> {sCount} Soal</span>
                  </div>

                  <div className="flex items-center gap-1 relative z-10">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100" onClick={() => exportBank(m)} title="Export JSON">
                      <Download className="h-4 w-4" />
                    </Button>
                    {canEdit && (
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400" onClick={() => remove(m.id)} title="Hapus">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {shown.length === 0 && (
            <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                <FileText className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium">Belum ada modul bank soal.</p>
              </div>
            </div>
          )}
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


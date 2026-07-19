import re

with open('src/routes/_authenticated/admin.topik.$id.soal.tsx', 'r') as f:
    content = f.read()

# Replace 1: Header
header_old = """  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in duration-500 pb-12 pt-4">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between border-b border-slate-200 dark:border-white/10 pb-6">
        <div className="space-y-2">
          <div className="flex items-center text-sm font-medium text-muted-foreground gap-2">
            <Link to="/admin/modul" className="hover:text-primary transition-colors flex items-center gap-1">
              ← Modul
            </Link>
            <span>/</span>
            <Link to="/admin/modul/$id/topik" params={{ id: modul.id }} className="hover:text-primary transition-colors">
              {modul.nama}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-slate-400" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{topik.nama}</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold ml-2">
              {soals.length} Soal
            </span>
          </div>
        </div>
      </div>"""

header_new = """  return (
    <div className="relative min-h-screen">
      {/* Subtle radial glow background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white dark:from-indigo-950/20 dark:via-zinc-950 dark:to-zinc-950 -z-10" />
      
      <div className="mx-auto max-w-6xl space-y-12 animate-in fade-in duration-700 pb-32 pt-16 px-4 sm:px-6 lg:px-8">
        {/* Studio-Tier Header Section */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end justify-between">
          <div className="space-y-5">
            <div className="flex items-center text-sm font-medium text-slate-500 dark:text-zinc-400 gap-3">
              <Link to="/admin/modul" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                ← Bank Soal
              </Link>
              <span className="text-slate-300 dark:text-zinc-700">/</span>
              <Link to="/admin/modul/$id/topik" params={{ id: modul.id }} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {modul.nama}
              </Link>
            </div>
            
            <div className="flex flex-col gap-3">
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-zinc-50 leading-none">
                {topik.nama}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-sm font-bold border border-indigo-100 dark:border-indigo-500/20">
                  <ListChecks className="h-4 w-4" />
                  {soals.length} Soal Tersedia
                </span>
              </div>
            </div>
          </div>
        </div>"""

content = content.replace(header_old, header_new)

# Replace 2: Toolbar
toolbar_old = """      {/* Toolbar / Filters */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800" 
            placeholder="Cari kata kunci dalam soal…" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={tipe} onValueChange={setTipe}>
            <SelectTrigger className="w-full sm:w-44 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua tipe</SelectItem>
              {Object.entries(TIPE_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={kes} onValueChange={setKes}>
            <SelectTrigger className="w-full sm:w-40 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua kesulitan</SelectItem>
              {Object.entries(KES_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="w-full sm:w-auto font-semibold">
            <Plus className="mr-2 h-4 w-4" />Soal Baru
          </Button>
        </div>
      </div>"""

toolbar_new = """      {/* Premium Toolbar / Filters */}
      <div className="p-2.5 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <Input 
            className="pl-11 h-12 bg-white dark:bg-zinc-950 border-transparent hover:border-slate-200 dark:hover:border-zinc-800 focus:border-indigo-500 rounded-xl transition-all shadow-none text-base" 
            placeholder="Cari kata kunci dalam soal…" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={tipe} onValueChange={setTipe}>
            <SelectTrigger className="w-full sm:w-44 h-12 rounded-xl bg-white dark:bg-zinc-950 border-transparent hover:border-slate-200 dark:hover:border-zinc-800 shadow-none font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua tipe</SelectItem>
              {Object.entries(TIPE_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={kes} onValueChange={setKes}>
            <SelectTrigger className="w-full sm:w-40 h-12 rounded-xl bg-white dark:bg-zinc-950 border-transparent hover:border-slate-200 dark:hover:border-zinc-800 shadow-none font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua kesulitan</SelectItem>
              {Object.entries(KES_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="w-full sm:w-auto h-12 rounded-xl px-6 font-bold bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-md shadow-slate-900/10 dark:shadow-indigo-900/20 transition-all">
            <Plus className="mr-2 h-4 w-4" />Soal Baru
          </Button>
        </div>
      </div>"""

content = content.replace(toolbar_old, toolbar_new)

# Replace 3: Card list
cards_old = """      {/* Cards Section */}
      <div className="space-y-6">
        {shown.map((s, i) => (
          <div key={s.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                  {i + 1}
                </span>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {TIPE_LABEL[s.tipe]}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  s.kesulitan === 'mudah' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' :
                  s.kesulitan === 'sedang' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' :
                  'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                }`}>
                  {KES_LABEL[s.kesulitan]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="h-7 px-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100" onClick={() => { setEditing(s); setOpen(true); }}>
                  <Pencil className="h-3.5 w-3.5 sm:mr-1.5" /> <span className="hidden sm:inline">Edit</span>
                </Button>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => remove(s.id)}>
                  <Trash2 className="h-3.5 w-3.5 sm:mr-1.5" /> <span className="hidden sm:inline">Hapus</span>
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-5 space-y-5">
              <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
                <RichView html={s.detail} />
              </div>
              
              {s.tipe !== "essay" && (
                <div className="grid gap-2">
                  {s.jawaban.map((j, idx) => (
                    <div key={j.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      j.benar 
                        ? 'bg-emerald-50/50 border-emerald-500 dark:bg-emerald-950/20 dark:border-emerald-500/50' 
                        : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800'
                    }`}>
                      <span className={`flex shrink-0 items-center justify-center w-6 h-6 rounded-md font-mono text-sm font-semibold ${
                        j.benar 
                          ? 'bg-emerald-500 text-white dark:bg-emerald-600' 
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <div className={`flex-1 text-sm pt-0.5 ${j.benar ? 'text-emerald-900 dark:text-emerald-100' : 'text-slate-700 dark:text-slate-300'}`}>
                        <RichView html={j.detail} className="inline" />
                      </div>
                      {j.benar && (
                        <div className="flex shrink-0 items-center justify-center h-6">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {shown.length === 0 && (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Belum ada soal untuk topik ini.</p>
          </div>
        )}
      </div>"""

cards_new = """      {/* Studio-Tier Cards Section */}
      <div className="space-y-8">
        {shown.map((s, i) => (
          <div key={s.id} className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/40 dark:bg-zinc-950/40 gap-3">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 dark:bg-zinc-100 font-mono text-xs font-black text-white dark:text-zinc-900 shadow-sm">
                  {i + 1}
                </span>
                <span className="rounded-full bg-slate-200/60 dark:bg-zinc-800 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-zinc-400">
                  {TIPE_LABEL[s.tipe]}
                </span>
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                  s.kesulitan === 'mudah' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
                  s.kesulitan === 'sedang' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' :
                  'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                }`}>
                  {KES_LABEL[s.kesulitan]}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="ghost" className="h-8 px-3 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 font-medium" onClick={() => { setEditing(s); setOpen(true); }}>
                  <Pencil className="h-3.5 w-3.5 sm:mr-2" /> <span className="hidden sm:inline">Edit</span>
                </Button>
                <div className="w-px h-5 bg-slate-200 dark:bg-zinc-700 mx-1"></div>
                <Button size="sm" variant="ghost" className="h-8 px-3 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-medium" onClick={() => remove(s.id)}>
                  <Trash2 className="h-3.5 w-3.5 sm:mr-2" /> <span className="hidden sm:inline">Hapus</span>
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="text-base prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:tracking-tight">
                <RichView html={s.detail} />
              </div>
              
              {s.tipe !== "essay" && (
                <div className="grid gap-3 mt-4">
                  {s.jawaban.map((j, idx) => (
                    <div key={j.id} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      j.benar 
                        ? 'bg-emerald-50/80 border-emerald-500/50 dark:bg-emerald-500/10 dark:border-emerald-500/30 shadow-sm shadow-emerald-100/50 dark:shadow-none' 
                        : 'bg-white border-slate-200/80 hover:border-slate-300 dark:bg-zinc-900/50 dark:border-zinc-800 dark:hover:border-zinc-700'
                    }`}>
                      <span className={`flex shrink-0 items-center justify-center w-7 h-7 rounded-md font-mono text-sm font-bold shadow-sm ${
                        j.benar 
                          ? 'bg-emerald-500 text-white dark:bg-emerald-600' 
                          : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <div className={`flex-1 text-sm pt-1 font-medium ${j.benar ? 'text-emerald-950 dark:text-emerald-100' : 'text-slate-700 dark:text-zinc-300'}`}>
                        <RichView html={j.detail} className="inline" />
                      </div>
                      {j.benar && (
                        <div className="flex shrink-0 items-center justify-center h-7">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {shown.length === 0 && (
          <div className="py-24 text-center bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 mb-4">
              <BookOpen className="h-8 w-8 text-slate-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-100">Belum ada soal</h3>
            <p className="text-slate-500 dark:text-zinc-400 mt-1">Gunakan tombol "Soal Baru" untuk mulai menambahkan soal.</p>
          </div>
        )}
      </div>"""

content = content.replace(cards_old, cards_new)

# Add closing div
closing_old = """      <SoalDialog open={open} onOpenChange={setOpen} editing={editing} topikId={topikId} onSaved={refresh} />
    </div>
  );
}"""

closing_new = """      <SoalDialog open={open} onOpenChange={setOpen} editing={editing} topikId={topikId} onSaved={refresh} />
      </div>
    </div>
  );
}"""

content = content.replace(closing_old, closing_new)

with open('src/routes/_authenticated/admin.topik.$id.soal.tsx', 'w') as f:
    f.write(content)


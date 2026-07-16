import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ujianRepo, sesiRepo, usersRepo, soalRepo, hydrateRepos, mataKuliahRepo, semesterRepo } from "@/lib/cbt/repos";
import { recomputeSkor } from "@/lib/cbt/exam";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil, Save, X, BookOpen, Clock, FileText, ChevronRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { RichView } from "@/components/cbt/RichEditor";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/hasil/$id")({
  loader: async () => {
    try {
      await hydrateRepos();
    } catch {
      // Fallback ke cache; jangan brick navigasi saat snapshot gagal.
    }
  },
  component: HasilUjian,
});

function HasilUjian() {
  const { id } = useParams({ from: "/_authenticated/admin/hasil/$id" });
  const ujian = ujianRepo.byId(id);
  const [sesis, setSesis] = useState(sesiRepo.all().filter((s) => s.ujianId === id));
  const [openId, setOpenId] = useState<string | null>(null);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editSkor, setEditSkor] = useState<string>("");

  if (!ujian) return <div>Tidak ditemukan</div>;
  const users = usersRepo.all();
  
  const mk = ujian.mataKuliahId ? mataKuliahRepo.byId(ujian.mataKuliahId) : null;
  const smt = ujian.semesterId ? semesterRepo.byId(ujian.semesterId) : null;

  function refresh() {
    setSesis(sesiRepo.all().filter((s) => s.ujianId === id));
  }

  function saveEdit(sesiId: string, idx: number) {
    const s = sesiRepo.byId(sesiId);
    if (!s) return;
    const v = editSkor === "" ? undefined : Number(editSkor);
    const next = { ...s, jawaban: s.jawaban.map((j, i) => (i === idx ? { ...j, skor: v } : j)) };
    const recalc = recomputeSkor(next, ujian!);
    sesiRepo.upsert(recalc);
    setEditIdx(null);
    setEditSkor("");
    refresh();
    toast.success("Nilai diperbarui");
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-xl border shadow-sm">
        <Link to="/admin/hasil" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 w-fit mb-3">
          ← Kembali ke daftar hasil
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{ujian.nama}</h1>
            {mk && (
              <p className="text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
                <BookOpen className="h-4 w-4" />
                {mk.nama} {smt ? `· ${smt.nama}` : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 bg-background/60 backdrop-blur-sm px-4 py-2 rounded-lg border shadow-sm">
            <div className="text-center">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Durasi</div>
              <div className="font-semibold text-lg flex items-center justify-center gap-1"><Clock className="h-4 w-4 text-primary" /> {ujian.durasiMenit}'</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Soal</div>
              <div className="font-semibold text-lg flex items-center justify-center gap-1"><FileText className="h-4 w-4 text-primary" /> {ujian.topicSets.reduce((a, b) => a + b.jumlah, 0)}</div>
            </div>
          </div>
        </div>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-muted-foreground font-medium border-b">
                <tr>
                  <th className="p-4 font-semibold">Peserta</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Mulai</th>
                  <th className="p-4 font-semibold">Skor</th>
                  <th className="p-4 font-semibold">Pelanggaran</th>
                  <th className="p-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sesis.map((s) => {
                  const u = users.find((x) => x.id === s.pesertaId);
                  const isOpen = openId === s.id;
                  return (
                    <tr key={s.id} className={`border-b last:border-0 transition-colors ${isOpen ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
                      <td className="p-4 font-medium">{u?.namaLengkap ?? s.pesertaId}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          s.status === 'selesai' ? 'bg-success/15 text-success' :
                          s.status === 'sedang' ? 'bg-primary/15 text-primary' :
                          'bg-accent text-accent-foreground'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {s.mulaiAt ? new Date(s.mulaiAt).toLocaleString("id-ID") : "-"}
                      </td>
                      <td className="p-4">
                        {s.status === "selesai" ? (
                          <span className="font-bold text-base">{s.skorTotal ?? 0} <span className="text-xs text-muted-foreground font-normal">/ {s.maxSkor ?? 0}</span></span>
                        ) : "-"}
                      </td>
                      <td className="p-4">
                        {s.pelanggaran > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-destructive/15 text-destructive">
                            {s.pelanggaran} peringatan
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Button
                          size="sm"
                          variant={isOpen ? "default" : "outline"}
                          className="shadow-sm"
                          onClick={() => {
                            setOpenId(isOpen ? null : s.id);
                            setEditIdx(null);
                          }}
                        >
                          {isOpen ? "Tutup Lembar" : "Koreksi Lembar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (confirm("Hapus sesi ujian ini secara permanen?")) {
                              sesiRepo.remove(s.id);
                              refresh();
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {sesis.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      Belum ada sesi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {openId &&
        (() => {
          const s = sesis.find((x) => x.id === openId);
          if (!s) {
            return (
              <Card>
                <CardContent className="p-4 text-sm text-muted-foreground">
                  Detail sesi tidak lagi tersedia.
                </CardContent>
              </Card>
            );
          }
          return (
            <div className="mt-4 animate-in slide-in-from-top-2 fade-in duration-200">
              <Card className="border-primary/20 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <CardHeader className="bg-primary/5 pb-4 border-b">
                  <CardTitle className="text-lg flex items-center gap-2 text-primary">
                    <Pencil className="h-5 w-5" /> Lembar Koreksi Penilaian
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6 bg-muted/10">
                  {s.jawaban.map((j, i) => {
                    const soal = soalRepo.byId(j.soalId);
                    if (!soal) {
                      return (
                        <div key={i} className="space-y-1 rounded border border-dashed p-4 text-sm text-muted-foreground bg-background">
                          Soal #{i + 1} tidak ditemukan di bank soal saat ini.
                        </div>
                      );
                    }
                    const benarIds = soal.jawaban.filter((x) => x.benar).map((x) => x.id);
                    const selesai = s.status === "selesai";
                    const isEssay = soal.tipe === "essay";
                    const isCorrect = selesai && !isEssay && j.jawabanIds.length === benarIds.length && benarIds.every((id) => j.jawabanIds.includes(id));
                    
                    // Highlight unassembled essays
                    const needsGrading = isEssay && j.skor === undefined;

                    return (
                      <div key={i} className={`space-y-3 rounded-xl border p-4 text-sm bg-background transition-all ${needsGrading ? 'ring-2 ring-warning/50 border-warning/50 shadow-sm' : ''}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs">Soal #{i + 1}</span>
                            <span className="bg-muted px-2.5 py-1 rounded text-muted-foreground capitalize">{soal.tipe}</span>
                            {selesai && (
                              isEssay ? (
                                <span className={needsGrading ? "text-warning bg-warning/10 px-2.5 py-1 rounded-md font-semibold" : "text-primary bg-primary/10 px-2.5 py-1 rounded-md font-semibold"}>
                                  {j.skor !== undefined ? `Skor Diperoleh: ${j.skor}` : "Menunggu Dinilai"}
                                </span>
                              ) : isCorrect ? (
                                <span className="text-success bg-success/15 px-2.5 py-1 rounded-md flex items-center gap-1 font-semibold"><CheckCircle2 className="h-3.5 w-3.5" />Benar</span>
                              ) : (
                                <span className="text-destructive bg-destructive/15 px-2.5 py-1 rounded-md flex items-center gap-1 font-semibold"><X className="h-3.5 w-3.5" />Salah</span>
                              )
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border">
                            {editIdx === i ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  className="h-8 w-24 text-center font-bold"
                                  placeholder="Skor..."
                                  value={editSkor}
                                  onChange={(e) => setEditSkor(e.target.value)}
                                  autoFocus
                                />
                                <Button size="sm" variant="default" onClick={() => saveEdit(s.id, i)} className="h-8 px-3 shadow-sm">
                                  Simpan
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditIdx(null)} className="h-8 px-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                                  Batal
                                </Button>
                              </div>
                            ) : isEssay ? (
                              <Button
                                size="sm"
                                variant={needsGrading ? "default" : "secondary"}
                                className={`h-8 text-xs ${needsGrading ? 'shadow-sm animate-pulse' : ''}`}
                                onClick={() => {
                                  setEditIdx(i);
                                  setEditSkor(String(j.skor ?? ""));
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                {needsGrading ? "Beri Nilai" : "Ubah Nilai"}
                              </Button>
                            ) : null}
                          </div>
                        </div>
                        <div className="pt-2">
                          <RichView html={soal.detail} className="prose prose-sm max-w-none" />
                        </div>
                        {isEssay && (
                          <div className="mt-3 rounded-lg bg-muted/40 border p-3 text-sm space-y-1">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Jawaban Peserta:</div>
                            <div className="prose prose-sm max-w-none bg-background p-3 rounded shadow-sm border">
                              <RichView html={j.jawabanEssay || "<em>(kosong)</em>"} />
                            </div>
                          </div>
                        )}
                        {!isEssay && (
                          <div className="mt-3 space-y-2">
                            {soal.jawaban.map((opt) => {
                              const isSelected = j.jawabanIds.includes(opt.id);
                              const isBenar = opt.benar;
                              let bgStyle = "bg-background border";
                              let textStyle = "text-foreground";
                              
                              if (isBenar && isSelected) { bgStyle = "bg-success/10 border-success/30"; textStyle = "text-success-foreground font-medium"; }
                              else if (isBenar && !isSelected) { bgStyle = "bg-success/5 border-success/30"; textStyle = "text-success-foreground font-medium"; }
                              else if (!isBenar && isSelected) { bgStyle = "bg-destructive/10 border-destructive/30"; textStyle = "text-destructive-foreground font-medium"; }

                              return (
                                <div key={opt.id} className={`flex items-start gap-2.5 p-2.5 rounded-lg ${bgStyle} ${textStyle}`}>
                                  <div className="mt-0.5 shrink-0">
                                    {isBenar ? <CheckCircle2 className="h-4 w-4 text-success" /> : isSelected ? <X className="h-4 w-4 text-destructive" /> : <div className="h-4 w-4 rounded-full border-2 border-muted" />}
                                  </div>
                                  <div className="flex-1 text-sm prose prose-sm leading-snug">
                                    <RichView html={opt.detail} />
                                  </div>
                                  {isSelected && <div className="text-[10px] uppercase font-bold tracking-wider bg-background px-1.5 py-0.5 rounded border opacity-70">Dipilih</div>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          );
        })()}
    </div>
  );
}

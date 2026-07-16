import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ujianRepo, sesiRepo, soalRepo, mataKuliahRepo, semesterRepo } from "@/lib/cbt/repos";
import { useAuthStore } from "@/lib/cbt/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RichView } from "@/components/cbt/RichEditor";
import { AudioPlayer } from "@/components/cbt/AudioPlayer";
import { CheckCircle2, XCircle, Award, BookOpen, Clock, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/peserta/ujian/$id/hasil")({
  component: HasilPeserta,
});

function HasilPeserta() {
  const { id } = useParams({ from: "/_authenticated/peserta/ujian/$id/hasil" });
  const user = useAuthStore((s) => s.user)!;
  const ujian = ujianRepo.byId(id);
  const sesi = sesiRepo.all().find((s) => s.ujianId === id && s.pesertaId === user.id && s.status === "selesai");

  if (!ujian || !sesi) return <div>Hasil tidak ditemukan</div>;
  const pct = sesi.maxSkor ? Math.round((sesi.skorTotal! / sesi.maxSkor) * 100) : 0;

  const mk = ujian.mataKuliahId ? mataKuliahRepo.byId(ujian.mataKuliahId) : null;
  const smt = ujian.semesterId ? semesterRepo.byId(ujian.semesterId) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <Link to="/peserta" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 w-fit mb-2">
        ← Kembali ke daftar ujian
      </Link>
      
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-primary p-8 text-primary-foreground shadow-lg text-center">
        <div className="relative z-10 space-y-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{ujian.nama}</h1>
            {mk && (
              <p className="text-primary-foreground/80 font-medium">
                {mk.nama} {smt ? `· ${smt.nama}` : ""}
              </p>
            )}
          </div>

          {ujian.showResult ? (
            <div className="bg-background/10 backdrop-blur-md rounded-2xl p-6 mx-auto w-fit min-w-[280px] shadow-sm border border-primary-foreground/20">
              <div className="text-sm text-primary-foreground/90 font-medium mb-1 uppercase tracking-wider">Skor Akhir</div>
              <div className="text-6xl font-black text-white drop-shadow-sm flex items-center justify-center gap-2">
                {sesi.skorTotal}
              </div>
              <div className="text-primary-foreground/80 mt-2 font-medium">
                dari batas maksimal {sesi.maxSkor}
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                <Award className="h-4 w-4" />
                Akurasi {pct}%
              </div>
            </div>
          ) : (
            <div className="bg-background/10 backdrop-blur-md rounded-2xl p-6 mx-auto w-fit border border-primary-foreground/20">
              <div className="text-primary-foreground/90 font-medium">
                Hasil tidak ditampilkan oleh penyelenggara ujian.
              </div>
            </div>
          )}
        </div>
        <div className="absolute -left-10 -top-10 z-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 z-0 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      </div>

      {ujian.showResult && ujian.showResultDetail && (
        <Card className="shadow-md border-0 ring-1 ring-border/50">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Lembar Pembahasan Soal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
          <h3 className="font-medium">Pembahasan</h3>
          {sesi.jawaban.map((j, i) => {
            const soal = soalRepo.byId(j.soalId);
            if (!soal) {
              return (
                <div key={i} className="rounded border border-dashed p-3 text-sm text-muted-foreground">
                  Soal #{i + 1} tidak tersedia lagi di bank soal.
                </div>
              );
            }
            const benarIds = soal.jawaban.filter((x) => x.benar).map((x) => x.id);
            const isEssay = soal.tipe === "essay";
            const correct = !isEssay && j.jawabanIds.length === benarIds.length && benarIds.every((id) => j.jawabanIds.includes(id));
            return (
              <div key={i} className="rounded border p-3 space-y-2 text-sm">
                <div className="flex items-center gap-3 text-sm font-medium border-b pb-3 mb-3">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs">
                    Soal #{i + 1}
                  </div>
                  <div className="text-muted-foreground capitalize text-xs bg-muted px-2 py-1 rounded">
                    {soal.tipe}
                  </div>
                  <div className="ml-auto">
                    {isEssay ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-accent text-accent-foreground">
                        {typeof j.skor === "number" ? `Skor: ${j.skor}` : "Menunggu Penilaian"}
                      </span>
                    ) : correct ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-success/15 text-success">
                        <CheckCircle2 className="h-4 w-4" /> Benar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-destructive/15 text-destructive">
                        <XCircle className="h-4 w-4" /> Salah
                      </span>
                    )}
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  <RichView html={soal.detail} />
                </div>
                {soal.audioFileId && (
                  <AudioPlayer fileId={soal.audioFileId} playOnce={false} />
                )}
                
                {soal.tipe === "essay" && (
                  <div className="mt-4 rounded-lg bg-muted/30 border p-4 space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jawaban Anda:</div>
                    <div className="prose prose-sm max-w-none bg-background p-3 rounded border">
                      <RichView html={j.jawabanEssay || "<em>(Tidak ada jawaban)</em>"} />
                    </div>
                  </div>
                )}
                {soal.tipe !== "essay" && (
                  <div className="mt-4 space-y-2">
                    {soal.jawaban.map((opt) => {
                      const isSelected = j.jawabanIds.includes(opt.id);
                      const isCorrect = opt.benar;
                      let bgClass = "bg-background border";
                      let textClass = "text-foreground";
                      if (isCorrect && isSelected) { bgClass = "bg-success/10 border-success/30"; textClass = "text-success-foreground font-medium"; }
                      else if (isCorrect && !isSelected) { bgClass = "bg-success/5 border-success/30"; textClass = "text-success-foreground font-medium"; }
                      else if (!isCorrect && isSelected) { bgClass = "bg-destructive/10 border-destructive/30"; textClass = "text-destructive-foreground font-medium"; }

                      return (
                        <div key={opt.id} className={`flex items-start gap-3 p-3 rounded-lg ${bgClass} ${textClass}`}>
                          <div className="mt-0.5 shrink-0">
                            {isCorrect ? <CheckCircle2 className="h-5 w-5 text-success" /> : isSelected ? <XCircle className="h-5 w-5 text-destructive" /> : <div className="h-5 w-5 rounded-full border-2 border-muted" />}
                          </div>
                          <div className="flex-1 text-sm prose prose-sm">
                            <RichView html={opt.detail} />
                          </div>
                          {isSelected && <div className="text-xs font-semibold bg-background px-2 py-1 rounded shadow-sm border">Jawaban Anda</div>}
                        </div>
                      );
                    })}
                  </div>
                )}
                {soal.pembahasan && (
                  <div className="mt-4 rounded-lg bg-info/10 border border-info/20 p-4">
                    <div className="text-xs font-semibold text-info-foreground uppercase tracking-wider mb-2">Penjelasan Singkat:</div>
                    <div className="prose prose-sm max-w-none text-info-foreground/90">
                      <RichView html={soal.pembahasan} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
        </Card>
      )}

      <div className="flex justify-center pt-4">
        <Button asChild size="lg" variant="outline" className="w-full sm:w-auto shadow-sm">
          <Link to="/peserta">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
}

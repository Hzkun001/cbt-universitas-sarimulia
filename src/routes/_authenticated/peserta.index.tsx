import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/cbt/auth-store";
import { ujianRepo, sesiRepo, mataKuliahRepo, semesterRepo } from "@/lib/cbt/repos";
import { isParticipantAssignedToExam } from "@/lib/cbt/access";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileText, CalendarClock, CalendarX, ArrowRight, BookOpen } from "lucide-react";
import { getExamAvailabilityStatus } from "@/lib/cbt/availability";
import { RichView } from "@/components/cbt/RichEditor";

export const Route = createFileRoute("/_authenticated/peserta/")({
  component: PesertaDashboard,
});

function PesertaDashboard() {
  const user = useAuthStore((s) => s.user)!;
  // Group-assignment filter uses the shared policy helper so the
  // dashboard and the pre-exam route can't drift apart (Issue #8).
  const ujian = ujianRepo.all().filter((u) => isParticipantAssignedToExam(user, u));
  const sesi = sesiRepo.all().filter((s) => s.pesertaId === user.id);

  return (
    <div className="space-y-8 pb-10">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/90 to-primary p-8 text-primary-foreground shadow-md">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Halo, {user.namaLengkap}</h1>
          <p className="max-w-xl text-primary-foreground/80">
            Selamat datang di portal ujian Anda. Kerjakan ujian dengan jujur dan teliti. 
            Semoga mendapatkan hasil yang terbaik.
          </p>
        </div>
        <div className="absolute -right-10 -top-10 z-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 right-20 z-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Daftar Ujian Anda</h2>


      {ujian.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Belum ada ujian yang diberikan untuk Anda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ujian.map((u) => {
            const s = sesi.find((x) => x.ujianId === u.id);
            const status = s?.status ?? "belum";
            const selesai = status === "selesai";
            const availability = getExamAvailabilityStatus(u);
            const isStartable = availability === "active" || availability === "open";
            const mk = u.mataKuliahId ? mataKuliahRepo.byId(u.mataKuliahId) : null;
            const smt = u.semesterId ? semesterRepo.byId(u.semesterId) : null;
            return (
              <Card key={u.id} className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="flex items-start gap-2 text-lg leading-tight">
                      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      {u.nama}
                    </CardTitle>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {status === "belum" ? "Belum" : status === "sedang" ? "Sedang" : "Selesai"}
                    </span>
                  </div>
                  {mk && (
                    <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      {mk.nama} {smt ? `· ${smt.nama}` : ""}
                    </div>
                  )}
                  <CardDescription className="flex items-center gap-3 text-xs mt-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {u.durasiMenit} menit
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> {u.topicSets.reduce((a, b) => a + b.jumlah, 0)} soal
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <RichView
                    className="text-sm text-muted-foreground line-clamp-3"
                    html={u.deskripsi}
                  />
                  {availability === "upcoming" && (
                    <div className="flex items-start gap-2 rounded border border-info/30 bg-info/10 p-2 text-xs">
                      <CalendarClock className="h-4 w-4 shrink-0 text-info-foreground" />
                      <span>
                        Dibuka {u.beginAt ? new Date(u.beginAt).toLocaleString("id-ID") : ""}
                      </span>
                    </div>
                  )}
                  {availability === "ended" && (
                    <div className="flex items-start gap-2 rounded border border-destructive/30 bg-destructive/10 p-2 text-xs">
                      <CalendarX className="h-4 w-4 shrink-0 text-destructive" />
                      <span>
                        Ditutup {u.endAt ? new Date(u.endAt).toLocaleString("id-ID") : ""}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-end pt-2">
                    {selesai ? (
                      <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                        <Link to="/peserta/ujian/$id/hasil" params={{ id: u.id }}>
                          Lihat Hasil
                        </Link>
                      </Button>
                    ) : isStartable ? (
                      <Button asChild size="sm" className="w-full sm:w-auto group-hover:bg-primary/90 transition-colors">
                        <Link to="/peserta/ujian/$id" params={{ id: u.id }}>
                          {status === "sedang" ? "Lanjutkan Ujian" : "Mulai Ujian"}
                          <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="w-full sm:w-auto">
                        {availability === "upcoming" ? "Belum Dibuka" : "Sudah Berakhir"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { configRepo, hydrateRepos } from "@/lib/cbt/repos";
import { ConfigSchema } from "@/lib/cbt/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/pengaturan")({
  loader: async () => {
    try {
      await hydrateRepos();
    } catch {
      // Fallback ke cache; jangan brick navigasi saat snapshot gagal.
    }
  },
  component: PengaturanPage,
});

function PengaturanPage() {
  const [cfg, setCfg] = useState(configRepo.get());
  const fileInputRef = useRef<HTMLInputElement>(null);

  function save() {
    const parsed = ConfigSchema.safeParse(cfg);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Konfigurasi tidak valid");
      return;
    }
    configRepo.set(parsed.data);
    toast.success("Pengaturan disimpan.");
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (PNG, JPG, dll).");
      return;
    }

    try {
      const base64Str = await resizeImage(file, 200);
      setCfg({ ...cfg, appLogo: base64Str });
      toast.success("Logo berhasil ditambahkan.");
    } catch (err) {
      toast.error("Gagal memproses gambar logo.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link to="/admin" className="text-sm text-muted-foreground hover:underline">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" /> Pengaturan
        </h1>
        <p className="text-sm text-muted-foreground">Identitas aplikasi & kebijakan ujian.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identitas Aplikasi</CardTitle>
          <CardDescription>
            Nama dan deskripsi yang ditampilkan di header dan login.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Nama aplikasi</Label>
            <Input
              value={cfg.appName}
              onChange={(e) => setCfg({ ...cfg, appName: e.target.value })}
            />
          </div>
          <div>
            <Label>URL Logo Aplikasi (Opsional)</Label>
            <div className="flex gap-4 items-start mt-1.5">
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={cfg.appLogo ?? ""}
                    placeholder="https://.../logo.png atau klik Upload"
                    onChange={(e) => setCfg({ ...cfg, appLogo: e.target.value })}
                  />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleLogoUpload}
                  />
                  <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Kosongkan untuk menggunakan ikon bawaan sistem. Gambar yang diupload akan dikompresi otomatis.</p>
              </div>
              <div className="h-12 w-12 rounded-lg border bg-muted/50 flex items-center justify-center shrink-0 overflow-hidden">
                {cfg.appLogo ? (
                  <img src={cfg.appLogo} alt="Logo" className="h-8 w-8 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
                ) : (
                  <span className="text-xs text-muted-foreground">None</span>
                )}
              </div>
            </div>
          </div>
          <div>
            <Label>Deskripsi</Label>
            <Textarea
              value={cfg.appDeskripsi}
              onChange={(e) => setCfg({ ...cfg, appDeskripsi: e.target.value })}
            />
          </div>
          <div>
            <Label>Pesan di halaman login</Label>
            <Textarea
              value={cfg.pesanLogin}
              onChange={(e) => setCfg({ ...cfg, pesanLogin: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kebijakan Ujian</CardTitle>
          <CardDescription>Pengaturan default untuk perangkat & sesi.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            label="Kunci akses dari perangkat mobile"
            desc="Kontrol ini belum diberlakukan: membuka aplikasi dari perangkat mobile tetap diizinkan."
            checked={cfg.mobileLock}
            onChange={(v) => setCfg({ ...cfg, mobileLock: v })}
            disabled
            badge="Belum diberlakukan"
          />
          <ToggleRow
            label="Izinkan multi-device"
            desc="Kontrol ini belum diberlakukan: jumlah perangkat aktif belum dibatasi oleh sistem."
            checked={cfg.multiDevice}
            onChange={(v) => setCfg({ ...cfg, multiDevice: v })}
            disabled
            badge="Belum diberlakukan"
          />
        </CardContent>
      </Card>

      <Button onClick={save}>Simpan pengaturan</Button>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
  disabled = false,
  badge,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded border p-3">
      <div>
        <div className="flex items-center gap-2 text-sm font-medium">
          {label}
          {badge && (
            <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
              {badge}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      {/* Disabled controls are not yet enforced (Issue #13, V1 hide-and-document):
          the Switch is non-interactive so it cannot imply protection that does
          not exist. The stored config value is still shown read-only. */}
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

async function resizeImage(file: File, maxWidthOrHeight: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
          if (width > height) {
            height = Math.round((height * maxWidthOrHeight) / width);
            width = maxWidthOrHeight;
          } else {
            width = Math.round((width * maxWidthOrHeight) / height);
            height = maxWidthOrHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Use webp for better compression, fallback to png
        resolve(canvas.toDataURL("image/webp", 0.8));
      };
      img.onerror = () => reject(new Error("Invalid image"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

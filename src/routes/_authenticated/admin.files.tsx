import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  listFiles,
  putFile,
  deleteFile,
  getObjectURL,
  type FileMeta,
} from "@/lib/cbt/files";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/files")({
  component: FilesPage,
});

function FilesPage() {
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    const list = await listFiles();
    setFiles(list);
    const u: Record<string, string> = {};
    for (const f of list.filter((x) => x.mime.startsWith("image/"))) {
      const url = await getObjectURL(f.id);
      if (url) u[f.id] = url;
    }
    setUrls(u);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function onUpload(files: FileList | null) {
    if (!files) return;
    for (const f of Array.from(files)) {
      await putFile(f);
    }
    toast.success(`${files.length} file di-upload`);
    refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin" className="text-sm text-muted-foreground hover:underline">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">File Manager</h1>
          <p className="text-sm text-muted-foreground">
            Gambar & audio disimpan di storage server lokal. Referensikan di soal dengan ID file
            pada field audio/gambar terkait, bukan sebagai database browser.
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,audio/*"
            hidden
            onChange={(e) => {
              onUpload(e.target.files);
              e.target.value = "";
            }}
          />
          <Button onClick={() => inputRef.current?.click()}>
            <Upload className="mr-1 h-4 w-4" /> Upload
          </Button>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="rounded border-2 border-dashed p-12 text-center text-muted-foreground">
          Belum ada file. Klik <strong>Upload</strong> untuk menambah.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.map((f) => (
            <Card key={f.id}>
              <CardContent className="space-y-2 p-3">
                <div className="grid h-32 place-items-center overflow-hidden rounded bg-muted">
                  {f.mime.startsWith("image/") && urls[f.id] ? (
                    <img src={urls[f.id]} alt={f.name} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-sm text-muted-foreground">{f.mime}</span>
                  )}
                </div>
                <div className="text-xs">
                  <div className="line-clamp-1 font-medium">{f.name}</div>
                  <div className="text-muted-foreground">
                    {(f.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(`file://${f.id}`);
                      toast.success("ID disalin");
                    }}
                  >
                    <Copy className="mr-1 h-3 w-3" /> Copy ID
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm("Hapus file?")) return;
                      await deleteFile(f.id);
                      refresh();
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

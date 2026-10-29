import { useEffect, useState } from "react";
import { Copy, Download, Instagram, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

/**
 * Generates a story-sized PNG on demand. On phones it opens the native share sheet;
 * elsewhere it shows a preview with download / copy.
 */
export function ShareStoryButton({
  render,
  fileName,
  label = "Share as story",
  className = "",
}: {
  render: () => Promise<Blob>;
  fileName: string;
  label?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  // A data: URL rather than blob: so the preview passes the site's img-src CSP.
  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    let active = true;
    const reader = new FileReader();
    reader.onload = () => {
      if (active && typeof reader.result === "string") setUrl(reader.result);
    };
    reader.readAsDataURL(blob);
    return () => {
      active = false;
    };
  }, [blob]);

  async function onClick() {
    setBusy(true);
    try {
      const png = await render();
      const file = new File([png], fileName, { type: "image/png" });
      const isTouch =
        typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
      if (isTouch && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "Courseflix" });
          return;
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") return;
          // Fall through to the preview if the share sheet fails.
        }
      }
      setBlob(png);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create your story");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
  }

  async function copyImage() {
    if (!blob) return;
    try {
      if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) throw new Error();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("Story copied, paste it anywhere");
    } catch {
      toast.error("Copying images isn't supported here. Try Download instead.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={busy}
        aria-busy={busy}
        className={`shine inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand via-brand-glow to-brand-2 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-brand/30 transition hover:brightness-110 active:scale-[0.97] disabled:cursor-wait disabled:opacity-70 ${className}`}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Instagram className="h-4 w-4" />}
        {busy ? "Making your story…" : label}
      </button>

      <Dialog open={!!blob} onOpenChange={(open) => !open && setBlob(null)}>
        <DialogContent className="max-w-md border-white/10 bg-[#121216] p-6 sm:rounded-[2rem]">
          <DialogTitle className="font-mega text-2xl font-extrabold tracking-tight">
            Your{" "}
            <span className="font-serif-accent text-gradient-brand text-[1.15em] font-normal">
              story
            </span>{" "}
            is ready
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Post it to Instagram, Snapchat or the group chat.
          </DialogDescription>
          {url && (
            <img
              src={url}
              alt="Preview of your Courseflix story image"
              className="mx-auto mt-2 max-h-[55vh] w-auto rounded-2xl border border-white/10 shadow-2xl shadow-black/60"
            />
          )}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={download}
              className="shine inline-flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-brand-glow active:scale-[0.97]"
            >
              <Download className="h-4 w-4" /> Download
            </button>
            <button
              type="button"
              onClick={() => void copyImage()}
              className="glass inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition hover:border-brand/50 active:scale-[0.97]"
            >
              <Copy className="h-4 w-4" /> Copy image
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

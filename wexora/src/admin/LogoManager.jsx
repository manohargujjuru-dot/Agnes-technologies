import { useEffect, useRef, useState } from "react";
import { adminApi } from "../api.js";
import { useData } from "../context/DataContext.jsx";
import { Icon, LogoMark } from "../components/ui.jsx";
import { useAlert } from "../components/Alerts.jsx";
import { ConfirmDialog } from "./AdminShell.jsx";

const OUT = 512;            // every logo is normalised to a 512×512 square (sharp up to ~170px on 3× screens)
const PAD = 0.04;           // breathing room around the artwork, same as the built-in logo
const MAX_FILE = 8 * 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];

const loadImage = src => new Promise((ok, fail) => {
  const img = new Image();
  img.onload = () => ok(img);
  img.onerror = () => fail(new Error("That image couldn't be read — try a different file."));
  img.src = src;
});

/** Trim transparent / near-white margins, then centre the artwork on a 512×512 transparent square. */
async function normaliseLogo(file) {
  if (!TYPES.includes(file.type)) throw new Error("Choose a PNG, JPG, WebP, SVG or GIF image.");
  if (file.size > MAX_FILE) throw new Error("That file is larger than 8 MB.");
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const nw = img.naturalWidth || 1024, nh = img.naturalHeight || 1024;
    const scale = Math.min(1, 2000 / Math.max(nw, nh));
    const w = Math.max(1, Math.round(nw * scale)), h = Math.max(1, Math.round(nh * scale));
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const d = ctx.getImageData(0, 0, w, h).data;

    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const visible = d[i + 3] > 16 && Math.min(d[i], d[i + 1], d[i + 2]) < 240;
      if (visible) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    if (x1 < 0) throw new Error("The image looks empty (all white or transparent).");

    // near-white background → transparent, so the logo sits cleanly on light and dark tiles
    const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
    const crop = ctx.getImageData(x0, y0, cw, ch);
    for (let i = 0; i < crop.data.length; i += 4) {
      const m = Math.min(crop.data[i], crop.data[i + 1], crop.data[i + 2]);
      if (m > 235) crop.data[i + 3] = Math.round(crop.data[i + 3] * Math.max(0, 255 - m) / 20);
    }
    const cc = document.createElement("canvas"); cc.width = cw; cc.height = ch;
    cc.getContext("2d").putImageData(crop, 0, 0);

    const out = document.createElement("canvas"); out.width = OUT; out.height = OUT;
    const o = out.getContext("2d");
    o.imageSmoothingEnabled = true; o.imageSmoothingQuality = "high";
    const box = OUT * (1 - PAD * 2), k = Math.min(box / cw, box / ch);
    const dw = cw * k, dh = ch * k;
    o.drawImage(cc, (OUT - dw) / 2, (OUT - dh) / 2, dw, dh);

    let data = out.toDataURL("image/webp", 0.95);
    if (!data.startsWith("data:image/webp")) data = out.toDataURL("image/png"); // browsers without WebP encoding
    const bytes = Math.round((data.length - data.indexOf(",") - 1) * 0.75);
    if (bytes > 1024 * 1024) throw new Error("The processed logo is still over 1 MB — try a simpler image.");
    return { data, bytes, source: { w: nw, h: nh }, lowRes: Math.max(cw / scale, ch / scale) < 256 };
  } finally {
    URL.revokeObjectURL(url);
  }
}

const kb = n => `${Math.max(1, Math.round(n / 1024))} KB`;

export default function LogoManager() {
  const { settings, logoVersion, setLogoVersion } = useData();
  const alert = useAlert();
  const fileRef = useRef(null);
  const [pending, setPending] = useState(null);   // { data, bytes, source, lowRes, name }
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [askDelete, setAskDelete] = useState(false);

  const custom = !!logoVersion;
  const shown = pending?.data || (custom ? `/api/logo?v=${logoVersion}` : "");
  const [first, ...rest] = (settings.name || "Agnes Technologies").split(" ");

  useEffect(() => {
    const stop = e => e.preventDefault();
    window.addEventListener("dragover", stop); window.addEventListener("drop", stop);
    return () => { window.removeEventListener("dragover", stop); window.removeEventListener("drop", stop); };
  }, []);

  const pick = async file => {
    if (!file) return;
    setBusy(true);
    try {
      const r = await normaliseLogo(file);
      setPending({ ...r, name: file.name });
      if (r.lowRes) alert.warning("Low-resolution image", "This logo is small and may look soft. A 512 px or larger image is recommended.");
      else alert.info("Preview ready", "Check how it looks below, then click “Save logo”.");
    } catch (e) {
      alert.error("Couldn't use that image", e.message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async () => {
    setBusy(true);
    try {
      const r = await adminApi.uploadLogo(pending.data);
      setLogoVersion(r.version);
      setPending(null);
      alert.success("Logo updated", "The new logo is live across the website and admin portal.");
    } catch (e) {
      alert.error("Logo not saved", e.details?.image || e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      await adminApi.deleteLogo();
      setLogoVersion(null);
      setPending(null);
      setAskDelete(false);
      alert.success("Logo removed", "The website is back to the default logo.");
    } catch (e) {
      alert.error("Couldn't remove the logo", e.message);
    }
  };

  return (
    <section className="panel logo-manager">
      <div className="panel-head">
        <h2>Company logo</h2>
        <span className={`badge ${custom ? "badge-green" : "badge-gray"}`}>{custom ? "Custom logo" : "Default logo"}</span>
      </div>

      <div className="lm-grid">
        <div
          className={`lm-drop ${drag ? "is-drag" : ""} ${busy ? "is-busy" : ""}`}
          onDragEnter={e => { e.preventDefault(); setDrag(true); }}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
        >
          <div className="lm-current"><LogoMark size={148} src={shown || undefined} /></div>
          <p className="lm-drop-title">{pending ? pending.name : "Drag & drop a new logo here"}</p>
          <p className="muted small">
            {pending
              ? `Optimised to ${OUT}×${OUT} · ${kb(pending.bytes)} · from ${pending.source.w}×${pending.source.h}`
              : "PNG, JPG, WebP or SVG · square or wide · up to 8 MB. Margins are trimmed and the logo is centred automatically."}
          </p>
          <input ref={fileRef} type="file" accept={TYPES.join(",")} hidden onChange={e => pick(e.target.files?.[0])} />
          <div className="lm-actions">
            {pending ? (
              <>
                <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={busy}>
                  {busy ? <><span className="spinner" /> Saving…</> : <><Icon name="check" size={16} /> Save logo</>}
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setPending(null)} disabled={busy}>Cancel</button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => fileRef.current?.click()} disabled={busy}>
                  {busy ? <><span className="spinner" /> Processing…</> : custom ? "Change logo" : "Upload logo"}
                </button>
                {custom && <button type="button" className="btn btn-outline btn-sm lm-danger" onClick={() => setAskDelete(true)} disabled={busy}>Delete logo</button>}
              </>
            )}
          </div>
        </div>

        <div className="lm-previews">
          <p className="lm-label">{pending ? "Preview — not saved yet" : "Where it appears"}</p>
          <div className="lm-preview lm-light">
            <span className="lm-tag">Website navbar</span>
            <span className="logo lm-logo"><LogoMark src={shown || undefined} />
              <span className="logo-text"><strong>{settings.shortName || first}</strong>{rest.length > 0 && <small>{rest.join(" ")}</small>}</span>
            </span>
          </div>
          <div className="lm-preview lm-dark">
            <span className="lm-tag">Footer · dark mode</span>
            <span className="logo logo-light lm-logo"><LogoMark src={shown || undefined} />
              <span className="logo-text"><strong>{settings.shortName || first}</strong>{rest.length > 0 && <small>{rest.join(" ")}</small>}</span>
            </span>
          </div>
          <div className="lm-preview lm-light lm-row">
            <span className="lm-tag">Admin portal</span>
            <span className="lm-sizes">
              <span><LogoMark size={52} src={shown || undefined} /><em>Login</em></span>
              <span><LogoMark size={40} src={shown || undefined} /><em>Sidebar</em></span>
              <span><LogoMark size={24} src={shown || undefined} /><em>Tab icon</em></span>
            </span>
          </div>
        </div>
      </div>

      {askDelete && (
        <ConfirmDialog title="Delete custom logo?" icon="trash" confirmLabel="Yes, delete"
          message="The uploaded logo will be removed and the website will go back to the default logo."
          onCancel={() => setAskDelete(false)} onConfirm={remove} />
      )}
    </section>
  );
}

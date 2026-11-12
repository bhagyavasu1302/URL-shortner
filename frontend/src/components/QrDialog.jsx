import { Download, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function QrDialog({ url, onClose }) {
  if (!url) return null;
  function downloadQr() {
    const svg = document.querySelector("#link-qr svg");
    if (!svg) return;
    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `${url.shortCode}-qr.svg`;
    anchor.click();
    URL.revokeObjectURL(downloadUrl);
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-title"
        className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
            Your QR code
          </span>
          <button type="button" onClick={onClose} className="icon-button" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        <h2 id="qr-title" className="mt-4 text-xl font-bold text-slate-900">
          Scan to open
        </h2>
        <div
          id="link-qr"
          className="mx-auto my-6 inline-block rounded-2xl border border-slate-100 p-4"
        >
          <QRCodeSVG value={url.shortUrl} size={192} level="H" includeMargin />
        </div>
        <p className="break-all text-sm font-medium text-emerald-800">{url.shortUrl}</p>
        <button
          type="button"
          onClick={downloadQr}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#143e32] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#205b47]"
        >
          <Download size={16} /> Download SVG
        </button>
      </section>
    </div>
  );
}

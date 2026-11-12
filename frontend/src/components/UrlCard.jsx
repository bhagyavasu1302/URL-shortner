import {
  BarChart3,
  Copy,
  ExternalLink,
  MoreHorizontal,
  QrCode,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../api/client.js";

function shortDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export default function UrlCard({ url, onChange, onQr }) {
  const [editing, setEditing] = useState(false);
  const [destination, setDestination] = useState(url.originalUrl);
  const [busy, setBusy] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Clipboard access is unavailable in this browser");
    }
  }

  async function toggleActive() {
    try {
      const { data } = await api.patch(`/urls/${url._id ?? url.id}`, { isActive: !url.isActive });
      onChange(data.data.url);
      toast.success(data.data.url.isActive ? "Link enabled" : "Link disabled");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function saveDestination(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.patch(`/urls/${url._id ?? url.id}`, { originalUrl: destination });
      onChange(data.data.url);
      setEditing(false);
      toast.success("Destination updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this link and its click history? This cannot be undone.")) return;
    try {
      await api.delete(`/urls/${url._id ?? url.id}`);
      onChange(null, url._id ?? url.id);
      toast.success("Link deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <article
      className={`rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:border-emerald-200 sm:p-5 ${!url.isActive ? "opacity-70" : ""}`}
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={url.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-[#176b4a] hover:underline"
            >
              {url.shortUrl} <ExternalLink size={13} />
            </a>
            {!url.isActive && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Disabled
              </span>
            )}
            {url.expiresAt && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                Expires {shortDate(url.expiresAt)}
              </span>
            )}
          </div>
          {editing ? (
            <form onSubmit={saveDestination} className="mt-3 flex gap-2">
              <input
                autoFocus
                type="url"
                required
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                className="field-input"
                aria-label="New destination URL"
              />
              <button
                disabled={busy}
                className="rounded-xl bg-[#143e32] px-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy ? "…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setDestination(url.originalUrl);
                }}
                className="rounded-xl px-2 text-sm text-slate-500"
              >
                Cancel
              </button>
            </form>
          ) : (
            <p className="mt-1 max-w-2xl truncate text-sm text-slate-500" title={url.originalUrl}>
              {url.originalUrl}
            </p>
          )}
          <p className="mt-3 text-xs text-slate-400">Created {shortDate(url.createdAt)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="mr-2 text-right">
            <span className="block text-lg font-bold leading-tight text-slate-800">
              {url.totalClicks ?? 0}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-slate-400">clicks</span>
          </div>
          <button
            type="button"
            onClick={copyLink}
            className="icon-button"
            title="Copy short link"
            aria-label="Copy short link"
          >
            <Copy size={16} />
          </button>
          <button
            type="button"
            onClick={() => onQr(url)}
            className="icon-button"
            title="Show QR code"
            aria-label="Show QR code"
          >
            <QrCode size={16} />
          </button>
          <Link
            to={`/analytics/${url._id ?? url.id}`}
            className="icon-button"
            title="View analytics"
            aria-label="View analytics"
          >
            <BarChart3 size={16} />
          </Link>
          <div className="group relative">
            <button type="button" className="icon-button" aria-label="Link actions">
              <MoreHorizontal size={17} />
            </button>
            <div className="absolute right-0 top-full z-10 hidden w-44 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl group-focus-within:block group-hover:block">
              <button onClick={() => setEditing(true)} type="button" className="menu-action">
                <ExternalLink size={14} /> Edit destination
              </button>
              <button onClick={toggleActive} type="button" className="menu-action">
                {url.isActive ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}{" "}
                {url.isActive ? "Disable link" : "Enable link"}
              </button>
              <button
                onClick={remove}
                type="button"
                className="menu-action text-rose-600 hover:bg-rose-50"
              >
                <Trash2 size={14} /> Delete link
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

import { ArrowRight, Check, ChevronDown, Link2, Sparkles } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../api/client.js";

export default function UrlCreateForm({ onCreated }) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [aliasStatus, setAliasStatus] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);

  async function checkAlias(value) {
    if (!value) {
      setAliasStatus("");
      return;
    }
    try {
      const { data } = await api.get("/urls/check-alias", { params: { code: value } });
      setAliasStatus(data.data.available ? "available" : "taken");
    } catch (error) {
      setAliasStatus("");
      toast.error(getErrorMessage(error));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = { originalUrl: originalUrl.trim() };
      if (customAlias.trim()) payload.customAlias = customAlias.trim();
      if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString();
      const { data } = await api.post("/urls", payload);
      setOriginalUrl("");
      setCustomAlias("");
      setExpiresAt("");
      setAliasStatus("");
      toast.success("Your short link is ready");
      onCreated(data.data.url);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-white bg-white p-3 shadow-[0_24px_70px_-38px_rgba(15,45,34,.38)] sm:p-4"
    >
      <label
        htmlFor="original-url"
        className="mb-2 ml-2 block text-xs font-semibold uppercase tracking-[.13em] text-slate-400"
      >
        Your destination URL
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-[#f5f7f4] px-4">
          <Link2 className="shrink-0 text-emerald-700" size={19} />
          <input
            id="original-url"
            type="url"
            required
            maxLength={2048}
            value={originalUrl}
            onChange={(event) => setOriginalUrl(event.target.value)}
            placeholder="https://your-long-link.com/..."
            className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
        <button
          disabled={busy}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#143e32] px-6 text-sm font-semibold text-white transition hover:bg-[#205b47] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            "Creating…"
          ) : (
            <>
              Shorten link <ArrowRight size={17} />
            </>
          )}
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-2">
        <button
          type="button"
          onClick={() => setAdvanced((open) => !open)}
          className="flex items-center gap-1.5 py-2 text-xs font-medium text-slate-500 hover:text-[#143e32]"
        >
          <Sparkles size={14} /> Customize link{" "}
          <ChevronDown size={14} className={`transition ${advanced ? "rotate-180" : ""}`} />
        </button>
        <span className="text-[11px] text-slate-400">HTTP and HTTPS links · 7-character code</span>
      </div>
      {advanced && (
        <div className="grid gap-3 border-t border-slate-100 px-2 pb-2 pt-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="custom-alias"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Custom alias <span className="font-normal text-slate-400">optional</span>
            </label>
            <div className="relative">
              <input
                id="custom-alias"
                value={customAlias}
                maxLength={32}
                onChange={(event) => {
                  setCustomAlias(event.target.value);
                  setAliasStatus("");
                }}
                onBlur={() => checkAlias(customAlias.trim())}
                placeholder="your-name"
                className="field-input pr-9"
              />
              {aliasStatus === "available" && (
                <Check size={16} className="absolute right-3 top-3 text-emerald-600" />
              )}
            </div>
            {aliasStatus === "taken" && (
              <p className="mt-1 text-xs text-rose-600">That alias is already in use.</p>
            )}
            {aliasStatus === "available" && (
              <p className="mt-1 text-xs text-emerald-700">That alias is available.</p>
            )}
          </div>
          <div>
            <label htmlFor="expiry" className="mb-1.5 block text-xs font-semibold text-slate-600">
              Expiration <span className="font-normal text-slate-400">optional</span>
            </label>
            <input
              id="expiry"
              type="datetime-local"
              value={expiresAt}
              min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
              onChange={(event) => setExpiresAt(event.target.value)}
              className="field-input"
            />
          </div>
        </div>
      )}
    </form>
  );
}

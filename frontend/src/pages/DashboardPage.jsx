import { ArrowUpRight, Link2, MousePointer2, Plus, Search, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../api/client.js";
import LoadingScreen from "../components/LoadingScreen.jsx";
import QrDialog from "../components/QrDialog.jsx";
import UrlCard from "../components/UrlCard.jsx";
import UrlCreateForm from "../components/UrlCreateForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function DashboardPage() {
  const { user } = useAuth();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [qrUrl, setQrUrl] = useState(null);

  const loadUrls = useCallback(async () => {
    try {
      const { data } = await api.get("/urls");
      setUrls(data.data.urls);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUrls();
  }, [loadUrls]);

  const filtered = useMemo(
    () =>
      urls.filter((url) =>
        `${url.originalUrl} ${url.shortCode}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [urls, search],
  );
  const clicks = urls.reduce((sum, url) => sum + (url.totalClicks ?? 0), 0);

  function handleChange(updated, removedId) {
    if (!updated) {
      setUrls((items) => items.filter((item) => item._id !== removedId));
      return;
    }
    setUrls((items) =>
      items.map((item) => (item._id === updated._id ? { ...item, ...updated } : item)),
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-1.5 text-sm text-emerald-800">
            <Sparkles size={15} /> Your workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#143e32] sm:text-4xl">
            Good things are <span className="text-emerald-600">clicking.</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            A clear view of your links, {user?.email?.split("@")[0]}.
          </p>
        </div>
        <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 sm:block">
          Updated just now
        </span>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="stat-card">
          <span className="stat-icon bg-emerald-50 text-emerald-700">
            <Link2 size={18} />
          </span>
          <div>
            <span className="stat-label">Total links</span>
            <strong className="stat-value">{urls.length}</strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon bg-sky-50 text-sky-700">
            <MousePointer2 size={18} />
          </span>
          <div>
            <span className="stat-label">Total clicks</span>
            <strong className="stat-value">{clicks.toLocaleString()}</strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon bg-amber-50 text-amber-700">
            <ArrowUpRight size={18} />
          </span>
          <div>
            <span className="stat-label">Active links</span>
            <strong className="stat-value">{urls.filter((url) => url.isActive).length}</strong>
          </div>
        </div>
      </div>
      <section className="mt-9" aria-labelledby="create-heading">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
            <Plus size={16} />
          </span>
          <h2 id="create-heading" className="font-semibold text-slate-800">
            Create a short link
          </h2>
        </div>
        <UrlCreateForm onCreated={(created) => setUrls((items) => [created, ...items])} />
      </section>
      <section className="mt-10" aria-labelledby="links-heading">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 id="links-heading" className="text-lg font-semibold text-slate-900">
              Your links{" "}
              <span className="ml-1 text-sm font-normal text-slate-400">{urls.length}</span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Manage destinations and see how they perform.
            </p>
          </div>
          <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 sm:w-64">
            <Search size={15} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search links…"
              className="min-w-0 flex-1 text-sm outline-none placeholder:text-slate-400"
              aria-label="Search links"
            />
          </label>
        </div>
        {loading ? (
          <LoadingScreen />
        ) : filtered.length ? (
          <div className="space-y-3">
            {filtered.map((url) => (
              <UrlCard key={url._id} url={url} onChange={handleChange} onQr={setQrUrl} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Link2 size={21} />
            </span>
            <h3 className="mt-4 font-semibold text-slate-800">
              {search ? "No links match that search" : "Your first link starts here"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Try a different URL or alias."
                : "Paste a destination above and Blink will make it easy to share."}
            </p>
          </div>
        )}
      </section>
      <QrDialog url={qrUrl} onClose={() => setQrUrl(null)} />
    </div>
  );
}

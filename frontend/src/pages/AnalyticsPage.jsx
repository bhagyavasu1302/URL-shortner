import { ArrowLeft, BarChart3, ExternalLink, MousePointer2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast from "react-hot-toast";
import api, { getErrorMessage } from "../api/client.js";
import LoadingScreen from "../components/LoadingScreen.jsx";

export default function AnalyticsPage() {
  const { id } = useParams();
  const [days, setDays] = useState(30);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/urls/${id}/analytics`, { params: { days } })
      .then(({ data }) => setResult(data.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [id, days]);

  if (loading) return <LoadingScreen />;
  if (!result)
    return (
      <div className="mx-auto max-w-7xl px-5 py-16 text-center">
        <h1 className="text-xl font-semibold">Analytics unavailable</h1>
        <Link to="/dashboard" className="mt-4 inline-block text-sm text-emerald-700">
          Back to links
        </Link>
      </div>
    );
  const { analytics, url } = result;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-800"
      >
        <ArrowLeft size={16} /> Back to your links
      </Link>
      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-emerald-800">Link analytics</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#143e32]">
            {url.shortCode}
          </h1>
          <a
            href={url.shortUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-700"
          >
            {url.shortUrl} <ExternalLink size={13} />
          </a>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-500">
          Period{" "}
          <select
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
        </label>
      </div>
      <div className="mt-7 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Clicks over time</h2>
              <p className="mt-1 text-xs text-slate-500">Daily clicks in the selected period</p>
            </div>
            <span className="stat-icon bg-emerald-50 text-emerald-700">
              <BarChart3 size={17} />
            </span>
          </div>
          <div className="mt-6 h-64">
            {analytics.clicksPerDay.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analytics.clicksPerDay}
                  margin={{ top: 8, right: 12, bottom: 4, left: -18 }}
                >
                  <CartesianGrid stroke="#edf1ed" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickFormatter={(value) => value.slice(5)}
                    minTickGap={24}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e8eee9", fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#16845a"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#16845a" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-slate-400">
                No clicks in this period yet.
              </div>
            )}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">At a glance</h2>
              <p className="mt-1 text-xs text-slate-500">All-time link performance</p>
            </div>
            <span className="stat-icon bg-sky-50 text-sky-700">
              <MousePointer2 size={17} />
            </span>
          </div>
          <strong className="mt-8 block text-5xl font-semibold tracking-tight text-[#143e32]">
            {analytics.totalClicks.toLocaleString()}
          </strong>
          <span className="mt-1 block text-sm text-slate-500">total clicks</span>
          <div className="mt-7 space-y-3 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Top browsers
            </h3>
            {analytics.topBrowsers.length ? (
              analytics.topBrowsers.map((item) => (
                <div key={item.name} className="flex justify-between text-sm">
                  <span className="text-slate-600">{item.name}</span>
                  <span className="font-medium text-slate-800">{item.clicks}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No browser data yet.</p>
            )}
          </div>
        </section>
      </div>
      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
          <h2 className="font-semibold text-slate-900">Top referrers</h2>
          <p className="mt-1 text-xs text-slate-500">Where visitors came from</p>
          <div className="mt-5 space-y-3">
            {analytics.topReferrers.length ? (
              analytics.topReferrers.map((item) => (
                <div key={item.name} className="flex min-w-0 justify-between gap-3 text-sm">
                  <span className="truncate text-slate-600">{item.name}</span>
                  <span className="font-medium text-slate-800">{item.clicks}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No referrer data yet.</p>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
          <h2 className="font-semibold text-slate-900">Recent clicks</h2>
          <p className="mt-1 text-xs text-slate-500">
            Latest activity; no raw IP addresses are stored.
          </p>
          <div className="mt-5 space-y-3">
            {analytics.recentClicks.length ? (
              analytics.recentClicks.map((click, index) => (
                <div
                  key={`${click.clickedAt}-${index}`}
                  className="flex items-center justify-between gap-3 border-b border-slate-50 pb-3 last:border-0"
                >
                  <span className="min-w-0 truncate text-sm text-slate-700">
                    {click.browser} · {click.device}
                  </span>
                  <time className="shrink-0 text-xs text-slate-400">
                    {new Intl.DateTimeFormat(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(click.clickedAt))}
                  </time>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Clicks will show up here.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

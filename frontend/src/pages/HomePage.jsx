import {
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  Check,
  Link2,
  MousePointer2,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const features = [
  {
    icon: BarChart3,
    title: "Know what connects",
    copy: "See click trends, browsers, and referrers for every link.",
  },
  {
    icon: WandSparkles,
    title: "Make it memorable",
    copy: "Choose an alias that people can actually recognize.",
  },
  {
    icon: ShieldCheck,
    title: "Stay in control",
    copy: "Disable links, update destinations, or set an expiry.",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  return (
    <div>
      <section className="relative overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
        <div className="soft-grid absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              <Sparkles size={14} /> A little more insight in every link
            </span>
            <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-.055em] text-[#143e32] sm:text-6xl lg:text-[70px]">
              Short links.
              <br />
              <span className="text-emerald-600">Long story.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Create a clean link, share it anywhere, and understand what happens after the click.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-2 rounded-xl bg-[#143e32] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/10 transition hover:-translate-y-0.5 hover:bg-[#205b47]"
              >
                {user ? "Open your workspace" : "Get started — it's free"} <ArrowRight size={16} />
              </Link>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <Check size={14} className="text-emerald-600" /> No credit card needed
              </span>
            </div>
            <div className="mt-12 flex items-center gap-3 text-xs text-slate-400">
              <ArrowDownRight size={16} /> Simple by design, useful by default
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[500px]">
            <div className="absolute -left-7 top-14 h-36 w-36 rounded-full bg-emerald-200/50 blur-3xl" />
            <div className="absolute -right-5 bottom-5 h-40 w-40 rounded-full bg-amber-100/70 blur-3xl" />
            <div className="relative rotate-1 rounded-[28px] border border-white bg-white/85 p-5 shadow-[0_40px_100px_-45px_rgba(20,62,50,.4)] backdrop-blur sm:p-7">
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  <i className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                  <i className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <i className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400">
                  Link overview
                </span>
              </div>
              <div className="mt-7 rounded-2xl bg-[#f5f7f4] p-4">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Share this link
                </span>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-emerald-800">
                    blink.link/weekend-guide
                  </span>
                  <span className="rounded-lg bg-[#143e32] px-3 py-2 text-[10px] font-semibold text-white">
                    Copy
                  </span>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 p-4">
                  <span className="text-xs text-slate-400">Total clicks</span>
                  <div className="mt-1 flex items-end justify-between">
                    <strong className="text-2xl tracking-tight">2,481</strong>
                    <span className="text-xs font-semibold text-emerald-700">+18%</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-100 p-4">
                  <span className="text-xs text-slate-400">Top source</span>
                  <strong className="mt-2 block text-lg tracking-tight">Instagram</strong>
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">Clicks this week</span>
                  <span className="text-slate-400">Last 7 days</span>
                </div>
                <div className="mt-5 flex h-20 items-end gap-2">
                  {[30, 48, 36, 68, 51, 84, 63, 100, 72, 90, 61, 82, 54, 74].map(
                    (height, index) => (
                      <span
                        key={index}
                        style={{ height: `${height}%` }}
                        className={`flex-1 rounded-t-md ${index === 7 ? "bg-emerald-600" : "bg-emerald-100"}`}
                      />
                    ),
                  )}
                </div>
              </div>
              <div className="absolute -right-5 top-28 hidden items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-lg sm:flex">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                  <MousePointer2 size={15} />
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  A new click just landed
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="rounded-[28px] bg-[#143e32] p-6 text-white sm:p-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-300">
                Make it yours
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                One link, ready to go.
              </h2>
            </div>
            <Link
              to={user ? "/dashboard" : "/register"}
              className="hidden items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-white sm:flex"
            >
              Create a link <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-2 sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4 py-3.5 text-slate-400">
              <Link2 size={18} />
              <span className="truncate text-sm">Paste your long URL here…</span>
            </div>
            <Link
              to={user ? "/dashboard" : "/register"}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Try Blink <ArrowRight size={16} />
            </Link>
          </div>
          <p className="mt-3 text-xs text-emerald-100/70">
            Sign in to create, edit, and measure your short links.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-700">
            A better kind of short
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#143e32] sm:text-4xl">
            Small links, useful details.
          </h2>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, copy }, index) => (
            <article key={title} className="rounded-2xl border border-slate-200/80 bg-white p-6">
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl ${index === 1 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}
              >
                <Icon size={19} />
              </span>
              <h3 className="mt-5 font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

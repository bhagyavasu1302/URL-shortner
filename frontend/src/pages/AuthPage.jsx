import { ArrowLeft, ArrowRight, Link2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post(`/auth/${mode}`, { email: email.trim(), password });
      signIn(data.data);
      toast.success(isRegister ? "Your account is ready" : "Welcome back");
      navigate(location.state?.from?.pathname ?? "/dashboard", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-150px)] items-center px-5 py-12 sm:px-8">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_32px_90px_-55px_rgba(20,62,50,.5)] md:grid-cols-2">
        <div className="bg-[#143e32] p-8 text-white sm:p-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-emerald-100">
            <ArrowLeft size={15} /> Back home
          </Link>
          <span className="mt-16 grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
            <Link2 size={24} />
          </span>
          <h1 className="mt-7 text-3xl font-semibold tracking-tight">
            {isRegister ? "A better way to share starts here." : "Good to see you again."}
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-emerald-100/75">
            {isRegister
              ? "Create your account and keep every link, click, and insight in one tidy place."
              : "Your links and the stories behind them are right where you left them."}
          </p>
          <div className="mt-10 flex gap-2">
            {[0, 1, 2].map((item) => (
              <span key={item} className="h-1 w-9 rounded-full bg-emerald-400/70" />
            ))}
          </div>
        </div>
        <div className="p-8 sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-700">
            {isRegister ? "Create an account" : "Welcome back"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {isRegister ? "Get started for free" : "Sign in to Blink"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isRegister
              ? "Manage all your short links in one place."
              : "Pick up right where you left off."}
          </p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="field-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="field-input"
              />
            </div>
            <div>
              <label htmlFor="password" className="field-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
                minLength={isRegister ? 10 : 1}
                maxLength={72}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isRegister ? "At least 10 characters" : "Your password"}
                className="field-input"
              />
            </div>
            <button
              disabled={busy}
              className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#143e32] text-sm font-semibold text-white transition hover:bg-[#205b47] disabled:opacity-60"
            >
              {busy ? (
                "Please wait…"
              ) : (
                <>
                  {isRegister ? "Create account" : "Sign in"} <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            {isRegister ? "Already have an account?" : "New to Blink?"}{" "}
            <Link
              to={isRegister ? "/login" : "/register"}
              className="font-semibold text-emerald-800 hover:underline"
            >
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <p className="mt-8 text-center text-xs leading-5 text-slate-400">
            By continuing, you agree to use Blink responsibly. Link destinations must be safe and
            lawful.
          </p>
        </div>
      </div>
    </div>
  );
}

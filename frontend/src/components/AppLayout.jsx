import { ArrowUpRight, BarChart3, Link2, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function logout() {
    signOut();
    navigate("/");
  }

  const nav = (
    <>
      <NavLink
        to="/dashboard"
        onClick={() => setMenuOpen(false)}
        className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
      >
        <Link2 size={17} /> My links
      </NavLink>
      <a
        href="https://github.com/bhagyavasu1302/URL-shortner"
        target="_blank"
        rel="noreferrer"
        className="nav-link"
      >
        <BarChart3 size={17} /> Project <ArrowUpRight size={14} />
      </a>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f5f6f2]">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f9faf7]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Blink home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#143e32] text-white">
              <Link2 size={19} />
            </span>
            <span className="text-[19px] font-bold tracking-tight text-[#143e32]">
              blink<span className="text-emerald-500">.</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">{nav}</nav>
          <div className="hidden items-center gap-3 md:flex">
            <span className="max-w-40 truncate text-sm text-slate-500">{user?.email}</span>
            <button
              type="button"
              className="icon-button"
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
          <button
            type="button"
            className="icon-button md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className="flex flex-col gap-2 border-t border-slate-200 px-5 py-4 md:hidden">
            {nav}
            <button type="button" onClick={logout} className="nav-link">
              <LogOut size={17} /> Sign out
            </button>
          </div>
        )}
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>Thoughtful links. Less clutter.</span>
        <span>Built as a learning project · Blink</span>
      </footer>
    </div>
  );
}

export default function LoadingScreen() {
  return (
    <div
      className="grid min-h-[50vh] place-items-center text-sm font-medium text-slate-500"
      role="status"
    >
      <span className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" /> Loading your
        workspace…
      </span>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center pt-24" aria-busy="true" aria-label="Loading">
      <div className="flex items-center gap-3 font-mono text-xs text-mist-400">
        <span className="h-2 w-2 animate-pulseDot rounded-full bg-cyan-400" /> Establishing connection…
      </div>
    </div>
  );
}

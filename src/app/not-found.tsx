import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x grid min-h-[70vh] place-items-center pt-24 text-center">
      <div>
        <p className="font-mono text-sm text-cyan-400">ERR 404 · DESTINATION HOST UNREACHABLE</p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">This route doesn’t exist</h1>
        <p className="mx-auto mt-4 max-w-md text-mist-400">The page may have moved, or the link may be mistyped.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn-primary">Back home</Link>
          <Link href="/projects" className="btn-secondary">View projects</Link>
        </div>
      </div>
    </section>
  );
}

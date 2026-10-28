"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="container-x grid min-h-[70vh] place-items-center pt-24 text-center">
      <div>
        <p className="font-mono text-sm text-rose-300">Something went wrong</p>
        <h1 className="mt-4 text-3xl font-semibold">We hit an unexpected error</h1>
        <p className="mx-auto mt-3 max-w-md text-mist-400">Please try again. If the problem continues, use the contact page to let me know.</p>
        <button onClick={reset} className="btn-primary mt-8">Try again</button>
      </div>
    </section>
  );
}

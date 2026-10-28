import type { Metadata } from "next";
import { SignInForm } from "@/components/blog/SignInForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = sp.next && sp.next.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/";
  return (
    <section className="container-x grid min-h-[70vh] place-items-center pb-16 pt-32">
      <div className="glass w-full max-w-md p-8">
        <p className="eyebrow">Sign in</p>
        <h1 className="mt-3 text-2xl font-semibold">Verify your email</h1>
        <p className="mt-2 text-sm text-mist-400">We’ll email you a one-time link — no password needed. Used for commenting and site administration.</p>
        {sp.error && <p className="mt-4 rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">That sign-in link was invalid or expired. Please request a new one.</p>}
        <div className="mt-6"><SignInForm next={next} /></div>
      </div>
    </section>
  );
}

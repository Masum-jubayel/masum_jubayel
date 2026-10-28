import hljs from "highlight.js/lib/common";
import { CopyButton } from "./CopyButton";

/** Server-rendered syntax highlighting. highlight.js escapes the source, so output is safe. */
export function CodeBlock({ code, language }: { code: string; language: string }) {
  const html = hljs.getLanguage(language) ? hljs.highlight(code, { language }).value : hljs.highlightAuto(code).value;
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-ink-900">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-mist-500">{language}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed"><code className="hljs font-mono" dangerouslySetInnerHTML={{ __html: html }} /></pre>
    </div>
  );
}

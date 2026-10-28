import { highlightColors, highlightIconGroups, type HighlightIcon } from "@/content/highlights";
import { iconMap } from "@/components/ui/highlightIconMap";

type Values = { value?: string; label?: string; tag?: string; source?: string; icon?: string; hue?: string; sort?: number };

/**
 * Highlight card form fields with a visual icon picker (grouped, incl. cybersecurity set)
 * and colour swatches. Plain radio inputs, so it works inside server-action forms without JS.
 */
export function HighlightFields({ prefix, v = {}, withSort = true }: { prefix: string; v?: Values; withSort?: boolean }) {
  const icon = v.icon ?? "award";
  const hue = v.hue ?? "#3ee6ff";
  return (
    <>
      <div><label className="label" htmlFor={`${prefix}-value`}>Big value</label><input id={`${prefix}-value`} name="value" required maxLength={16} defaultValue={v.value} placeholder="CCNP · 20+ · M.A.S." className="input" /></div>
      <div className="lg:col-span-2"><label className="label" htmlFor={`${prefix}-label`}>Title</label><input id={`${prefix}-label`} name="label" required maxLength={80} defaultValue={v.label} placeholder="Cisco Enterprise Networking" className="input" /></div>
      <div><label className="label" htmlFor={`${prefix}-tag`}>Badge</label><input id={`${prefix}-tag`} name="tag" maxLength={20} defaultValue={v.tag ?? "Certified"} className="input" /></div>
      <div className="lg:col-span-2"><label className="label" htmlFor={`${prefix}-source`}>Issuer / year</label><input id={`${prefix}-source`} name="source" maxLength={80} defaultValue={v.source} placeholder="Cisco · 2027" className="input" /></div>
      {withSort && <div><label className="label" htmlFor={`${prefix}-sort`}>Order (lower = first)</label><input id={`${prefix}-sort`} name="sort" type="number" min={0} defaultValue={v.sort ?? 100} className="input" /></div>}

      <fieldset className="sm:col-span-2 lg:col-span-4">
        <legend className="label">Icon</legend>
        <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          {Object.entries(highlightIconGroups).map(([group, icons]) => (
            <div key={group}>
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-mist-500">{group}</p>
              <div className="flex flex-wrap gap-1.5">
                {(icons as readonly HighlightIcon[]).map((name) => {
                  const I = iconMap[name];
                  return (
                    <label key={name} title={name} className="cursor-pointer">
                      <input type="radio" name="icon" value={name} defaultChecked={name === icon} className="peer sr-only" />
                      <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-ink-900 text-mist-300 transition hover:border-cyan-400/40 hover:text-cyan-200 peer-checked:border-cyan-300 peer-checked:bg-cyan-400/15 peer-checked:text-cyan-200 peer-checked:shadow-[0_0_14px_rgba(62,230,255,0.35)] peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-400">
                        <I className="h-[18px] w-[18px]" aria-hidden />
                        <span className="sr-only">{name}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="sm:col-span-2 lg:col-span-4">
        <legend className="label">Colour</legend>
        <div className="flex flex-wrap gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          {highlightColors.map((c) => (
            <label key={c.hue} title={c.name} className="cursor-pointer">
              <input type="radio" name="hue" value={c.hue} defaultChecked={c.hue.toLowerCase() === hue.toLowerCase()} className="peer sr-only" />
              <span className="flex items-center gap-2 rounded-full border border-white/10 py-1 pl-1 pr-3 text-xs text-mist-300 transition peer-checked:border-white/60 peer-checked:text-mist-100 peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-400">
                <span className="h-5 w-5 rounded-full" style={{ background: c.hue, boxShadow: `0 0 10px ${c.hue}88` }} aria-hidden />
                {c.name}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}

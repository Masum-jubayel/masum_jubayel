/**
 * Make a link download the file immediately, saved under `name`.
 * - Files in Supabase Storage (other domain): the browser ignores the `download` attribute,
 *   so we ask Supabase itself to send the file as an attachment with that name (`?download=<name>`).
 * - Files on this site: the `download` attribute already works; the name is passed through.
 */
export function withExtension(name: string, src: string) {
  const clean = (name || "").trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ") || "download";
  if (/\.[a-z0-9]{2,5}$/i.test(clean)) return clean;
  const ext = /\.([a-z0-9]{2,5})(?:[?#]|$)/i.exec(src.split("#")[0])?.[1];
  return ext ? `${clean}.${ext.toLowerCase()}` : clean;
}

export function downloadHref(src: string, name?: string) {
  if (!src) return src;
  const base = src.split("#")[0];
  const fileName = withExtension(name || decodeURIComponent(base.split("?")[0].split("/").pop() || "download"), base);
  if (/\/storage\/v1\/object\/public\//.test(base)) {
    const u = base.replace(/([?&])download=[^&]*/g, "$1").replace(/[?&]$/, "");
    return `${u}${u.includes("?") ? "&" : "?"}download=${encodeURIComponent(fileName)}`;
  }
  return base;
}

/** Props for an <a> that downloads straight away with the given file name. */
export function downloadProps(src: string, name?: string) {
  const base = (src || "").split("#")[0];
  return { href: downloadHref(src, name), download: withExtension(name || base.split("/").pop() || "download", base) };
}

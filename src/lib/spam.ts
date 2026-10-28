/** Small heuristics shared by comments and contact. */
export function looksLikeSpam(text: string) {
  const links = (text.match(/https?:\/\/|www\./gi) || []).length;
  if (links > 2) return true;
  if (/(.)\1{14,}/.test(text)) return true; // long repeated chars
  if (/\b(viagra|casino|crypto ?airdrop|loan offer|seo services)\b/i.test(text)) return true;
  return false;
}

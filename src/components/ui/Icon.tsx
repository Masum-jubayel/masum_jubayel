import { Briefcase, Code2, Database, Languages, Network, RadioTower, Server, ShieldCheck, type LucideIcon } from "lucide-react";

export const skillIconNames = ["Code2", "Database", "RadioTower", "Network", "Server", "Briefcase", "ShieldCheck", "Languages"] as const;
const map: Record<string, LucideIcon> = { Network, Server, ShieldCheck, RadioTower, Code2, Database, Briefcase, Languages };
export function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const I = map[name] ?? Network;
  return <I className={className} aria-hidden />;
}

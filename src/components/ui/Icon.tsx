import { Bot, Briefcase, Cloud, Code2, Database, Kanban, Languages, Network, RadioTower, Server, ShieldCheck, Terminal, type LucideIcon } from "lucide-react";

export const skillIconNames = ["Code2", "Database", "RadioTower", "Network", "Server", "Briefcase", "ShieldCheck", "Languages", "Bot", "Cloud", "Terminal", "Kanban"] as const;
const map: Record<string, LucideIcon> = { Network, Server, ShieldCheck, RadioTower, Code2, Database, Briefcase, Languages, Bot, Cloud, Terminal, Kanban };
export function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const I = map[name] ?? Network;
  return <I className={className} aria-hidden />;
}

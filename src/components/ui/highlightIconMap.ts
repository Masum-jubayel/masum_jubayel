import {
  Award, BookOpen, Bot, Briefcase, Bug, Cable, Cloud, Code2, Cpu, Database, Eye, Fingerprint, Globe, GraduationCap, HardDrive,
  KeyRound, Lightbulb, Lock, Network, Radar, RadioTower, Rocket, Router, ScanLine, Server, ShieldAlert, ShieldCheck, ShieldEllipsis,
  BrickWall, Siren, Smartphone, SquareTerminal, Trophy, BadgeCheck, Users, Wifi, Workflow, Wrench, Zap, type LucideIcon,
} from "lucide-react";
import type { HighlightIcon } from "@/content/highlights";

export const iconMap: Record<HighlightIcon, LucideIcon> = {
  graduation: GraduationCap, book: BookOpen, award: Award, trophy: Trophy, certificate: BadgeCheck, lightbulb: Lightbulb,
  network: Network, cable: Cable, router: Router, wifi: Wifi, globe: Globe, radar: Radar, radio: RadioTower, smartphone: Smartphone,
  shield: ShieldCheck, shieldLock: ShieldEllipsis, shieldAlert: ShieldAlert, lock: Lock, key: KeyRound, fingerprint: Fingerprint,
  bug: Bug, scan: ScanLine, eye: Eye, siren: Siren, firewall: BrickWall, terminal: SquareTerminal,
  server: Server, database: Database, cloud: Cloud, cpu: Cpu, harddrive: HardDrive, wrench: Wrench,
  workflow: Workflow, code: Code2, briefcase: Briefcase, users: Users, zap: Zap, rocket: Rocket,
};
export const fallbackIcon: LucideIcon = Bot;

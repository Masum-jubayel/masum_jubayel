 
import type { CoverMotif, Project } from "@/content/projects";
import { LookImg } from "@/components/ui/LookMedia";

const NODE = "#0a1630";

/** Line-art illustration for each cover pattern (drawn on a 400×225 canvas). */
function Motif({ motif }: { motif: CoverMotif }) {
  switch (motif) {
    case "topology":
      return (
        <>
          <path className="cv-flow" d="M200 50 L120 110 L80 170 M200 50 L280 110 L320 170 M120 110 L280 110 M120 110 L200 170 L280 110" />
          {[[200, 50], [120, 110], [280, 110], [80, 170], [200, 170], [320, 170]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="9" fill={NODE} />)}
        </>
      );
    case "cabling":
      return (
        <>
          {Array.from({ length: 8 }).map((_, i) => <path key={i} className="cv-flow" d={`M${60 + i * 12} 40 C ${60 + i * 12} 120, ${180 + i * 18} 110, ${180 + i * 18} 185`} />)}
          <rect x="160" y="185" width="180" height="22" rx="3" fill={NODE} />
          {Array.from({ length: 12 }).map((_, i) => <rect key={i} className="cv-blink" style={{ animationDelay: `${i * 0.15}s` }} x={168 + i * 14} y="192" width="8" height="8" fill="#7ef3ff" fillOpacity=".4" stroke="none" />)}
        </>
      );
    case "radio":
      return (
        <>
          <rect x="170" y="70" width="60" height="110" rx="10" fill={NODE} />
          <path d="M215 70 V40" />
          {[30, 50, 70].map((r, i) => <path key={r} className="cv-pulse" style={{ animationDelay: `${i * 0.4}s` }} d={`M${215 - r} ${40 - r * 0.2} A ${r} ${r} 0 0 1 ${215 + r} ${40 - r * 0.2}`} />)}
          <rect x="180" y="85" width="40" height="30" rx="3" />
        </>
      );
    case "inventory":
      return (
        <>
          {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} className="cv-blink" style={{ animationDelay: `${(r * 4 + c) * 0.2}s` }} x={110 + c * 48} y={50 + r * 45} width="40" height="34" rx="3" fill={NODE} />))}
          <path d="M300 60 h40 M300 80 h30 M300 100 h40 M300 120 h20" />
        </>
      );
    case "web":
      return (
        <>
          <rect x="90" y="40" width="220" height="145" rx="8" fill={NODE} />
          <path d="M90 62 H310" />
          {[102, 112, 122].map((x) => <circle key={x} cx={x} cy="51" r="3" />)}
          <rect x="105" y="78" width="90" height="60" rx="4" className="cv-blink" />
          <path className="cv-type" d="M210 82 h85 M210 98 h70 M210 114 h80 M105 152 h190 M105 166 h120" />
        </>
      );
    case "code":
      return (
        <>
          <rect x="80" y="40" width="240" height="145" rx="8" fill={NODE} />
          <path d="M150 85 L120 112 L150 139 M250 85 L280 112 L250 139 M215 75 L185 150" strokeWidth="3" />
          <path className="cv-type" d="M100 165 h60 M170 165 h40 M220 165 h70" />
        </>
      );
    case "research":
      return (
        <>
          <path className="cv-draw" d="M70 170 L130 140 L180 150 L230 100 L280 115 L330 60" strokeWidth="2.5" />
          {[[70, 170], [130, 140], [180, 150], [230, 100], [280, 115], [330, 60]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill={NODE} />)}
          <path d="M60 185 H340 M60 185 V40" strokeOpacity=".3" />
        </>
      );
    case "lock":
      return (
        <>
          <path d="M170 105 V80 a30 30 0 0 1 60 0 V105" strokeWidth="3" />
          <rect x="150" y="105" width="100" height="80" rx="10" fill={NODE} />
          <circle cx="200" cy="140" r="9" className="cv-blink" />
          <path d="M200 149 V165" strokeWidth="3" />
        </>
      );
    case "firmware":
      return (
        <>
          <rect x="150" y="62" width="100" height="100" rx="8" fill={NODE} />
          <rect x="172" y="84" width="56" height="56" rx="4" className="cv-blink" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <path className="cv-flow" d={`M${162 + i * 19} 62 V36 M${162 + i * 19} 162 V188 M150 ${74 + i * 19} H124 M250 ${74 + i * 19} H276`} />
            </g>
          ))}
          <text x="200" y="117" textAnchor="middle" fontSize="13" fill="#cfe9ff" fillOpacity=".7" stroke="none" fontFamily="JetBrains Mono Variable, monospace">FW</text>
        </>
      );
    case "server":
      return (
        <>
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x="130" y={45 + i * 36} width="140" height="28" rx="4" fill={NODE} />
              <circle cx="148" cy={59 + i * 36} r="4" className="cv-blink" style={{ animationDelay: `${i * 0.3}s` }} fill="#34d399" fillOpacity=".7" />
              <path d={`M170 ${59 + i * 36} h80`} strokeOpacity=".35" />
            </g>
          ))}
        </>
      );
    case "cloud":
      return (
        <>
          <path d="M140 140 a35 35 0 0 1 10 -68 a45 45 0 0 1 85 -10 a35 35 0 0 1 25 78 Z" fill={NODE} strokeWidth="2" />
          <path className="cv-flow" d="M170 140 V190 M200 140 V200 M230 140 V190" />
          {[170, 200, 230].map((x, i) => <circle key={x} cx={x} cy={i === 1 ? 200 : 190} r="6" fill={NODE} />)}
        </>
      );
    case "backup":
      return (
        <>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <ellipse cx={110 + i * 90} cy="80" rx="34" ry="10" fill={NODE} />
              <path d={`M${76 + i * 90} 80 V140 a34 10 0 0 0 68 0 V80`} fill={NODE} />
              <path d={`M${76 + i * 90} 110 a34 10 0 0 0 68 0`} strokeOpacity=".4" />
              <path className="cv-blink" style={{ animationDelay: `${i * 0.5}s` }} d={`M${98 + i * 90} 170 l8 8 l16 -16`} strokeWidth="2.5" stroke="#34d399" />
            </g>
          ))}
          <path className="cv-flow" d="M144 95 H166 M234 95 H256" strokeWidth="2" />
        </>
      );
    case "camera":
      return (
        <>
          <rect x="155" y="55" width="90" height="120" rx="12" fill={NODE} />
          <circle cx="200" cy="100" r="24" />
          <circle cx="200" cy="100" r="11" className="cv-blink" />
          <circle cx="232" cy="68" r="4" fill="#f87171" fillOpacity=".8" className="cv-blink" />
          <path d="M175 145 h50 M175 158 h35" strokeOpacity=".4" />
        </>
      );
    case "iot":
      return (
        <>
          <path d="M120 185 V90 L200 50 L280 90 V185 Z" fill={NODE} />
          {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} className="cv-blink" style={{ animationDelay: `${(r * 3 + c) * 0.25}s` }} x={145 + c * 40} y={100 + r * 28} width="20" height="16" rx="2" />))}
          <path className="cv-flow" d="M280 120 C 320 120, 330 80, 350 70 M120 120 C 80 120, 70 80, 50 70" />
          <circle cx="350" cy="70" r="6" fill={NODE} /><circle cx="50" cy="70" r="6" fill={NODE} />
        </>
      );
    case "globe":
      return (
        <>
          <circle cx="200" cy="112" r="70" fill={NODE} />
          <ellipse cx="200" cy="112" rx="30" ry="70" />
          <path d="M130 112 H270 M140 77 H260 M140 147 H260" strokeOpacity=".5" />
          <ellipse cx="200" cy="112" rx="95" ry="28" className="cv-spin" strokeDasharray="4 6" />
        </>
      );
    case "terminal":
      return (
        <>
          <rect x="80" y="45" width="240" height="135" rx="8" fill={NODE} />
          <path d="M80 65 H320" />
          <path d="M100 90 l14 10 l-14 10" strokeWidth="2.5" />
          <path className="cv-type" d="M124 100 h120 M100 125 h90 M100 145 h150" />
          <rect x="196" y="118" width="10" height="14" className="cv-blink" fill="#7ef3ff" fillOpacity=".6" stroke="none" />
        </>
      );
    case "automation":
      return (
        <>
          <g className="cv-spin" style={{ transformOrigin: "165px 112px" }}>
            <circle cx="165" cy="112" r="38" fill={NODE} strokeDasharray="10 6" strokeWidth="6" />
          </g>
          <circle cx="165" cy="112" r="14" />
          <g className="cv-spin-rev" style={{ transformOrigin: "248px 82px" }}>
            <circle cx="248" cy="82" r="26" fill={NODE} strokeDasharray="8 5" strokeWidth="5" />
          </g>
          <circle cx="248" cy="82" r="9" />
          <path className="cv-flow" d="M210 150 H320" />
        </>
      );
    case "mobile":
      return (
        <>
          <rect x="165" y="35" width="70" height="155" rx="12" fill={NODE} />
          <path d="M190 48 h20" />
          {[0, 1, 2, 3].map((i) => <rect key={i} className="cv-blink" style={{ animationDelay: `${i * 0.3}s` }} x="178" y={65 + i * 26} width="44" height="18" rx="3" />)}
        </>
      );
    case "dashboard":
      return (
        <>
          <rect x="80" y="40" width="240" height="145" rx="8" fill={NODE} />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} className="cv-grow" style={{ animationDelay: `${i * 0.2}s`, transformOrigin: `${110 + i * 26}px 165px` }} x={102 + i * 26} y={165 - (30 + ((i * 37) % 60))} width="16" height={30 + ((i * 37) % 60)} rx="2" />)}
          <circle cx="270" cy="105" r="30" strokeDasharray="120 200" strokeWidth="6" className="cv-spin" style={{ transformOrigin: "270px 105px" }} />
        </>
      );
    case "wifi":
      return (
        <>
          {[25, 50, 75].map((r, i) => <path key={r} className="cv-pulse" style={{ animationDelay: `${i * 0.35}s` }} d={`M${200 - r} ${150 - r * 0.6} A ${r} ${r} 0 0 1 ${200 + r} ${150 - r * 0.6}`} strokeWidth="4" />)}
          <circle cx="200" cy="160" r="8" fill="#7ef3ff" fillOpacity=".6" stroke="none" />
        </>
      );
    case "shield":
    case "lab":
    default:
      return (
        <>
          <path d="M200 40 L250 60 V110 C250 145 225 165 200 180 C175 165 150 145 150 110 V60 Z" fill={NODE} />
          <path className="cv-draw" d="M180 110 L195 125 L222 95" strokeWidth="2.5" />
        </>
      );
  }
}

/** Generated (gently animated) cover art per project, or the uploaded cover image when set. */
export function ProjectCover({ project, className }: { project: Pick<Project, "slug" | "title" | "cover">; className?: string }) {
  const { from, to, motif, image } = project.cover;
  const id = `pc-${project.slug}`;
  if (image) {
    return (
      <div className={`relative overflow-hidden ${className ?? ""}`}>
        <LookImg src={image} alt={`Cover image for ${project.title}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${from}33, transparent 60%, ${to}44)` }} aria-hidden />
      </div>
    );
  }
  return (
    <svg viewBox="0 0 400 225" className={`cover-art ${className ?? ""}`} role="img" aria-label={`Cover illustration for ${project.title}`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} stopOpacity=".55" />
          <stop offset="1" stopColor={to} stopOpacity=".25" />
        </linearGradient>
        <pattern id={`${id}-p`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#7ef3ff" strokeOpacity=".07" />
        </pattern>
      </defs>
      <rect width="400" height="225" fill="#070d1d" />
      <rect width="400" height="225" fill={`url(#${id}-g)`} />
      <rect width="400" height="225" fill={`url(#${id}-p)`} />
      <g stroke="#cfe9ff" strokeOpacity=".55" fill="none" strokeWidth="1.5">
        <Motif motif={motif} />
      </g>
    </svg>
  );
}

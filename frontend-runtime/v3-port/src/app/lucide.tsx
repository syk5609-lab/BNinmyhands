import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {children}
    </svg>
  );
}

export const Activity = (props: IconProps) => <BaseIcon {...props}><path d="M3 12h4l3-9 4 18 3-9h4" /></BaseIcon>;
export const Clock = (props: IconProps) => <BaseIcon {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></BaseIcon>;
export const Database = (props: IconProps) => <BaseIcon {...props}><ellipse cx="12" cy="5" rx="7" ry="3" /><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5" /><path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></BaseIcon>;
export const LogIn = (props: IconProps) => <BaseIcon {...props}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /></BaseIcon>;
export const Users = (props: IconProps) => <BaseIcon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="3.5" /><path d="M20 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a3.5 3.5 0 0 1 0 6.75" /></BaseIcon>;
export const Shield = (props: IconProps) => <BaseIcon {...props}><path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" /></BaseIcon>;
export const LayoutDashboard = (props: IconProps) => <BaseIcon {...props}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="14" width="7" height="7" /></BaseIcon>;
export const ChevronDown = (props: IconProps) => <BaseIcon {...props}><path d="m6 9 6 6 6-6" /></BaseIcon>;
export const User = (props: IconProps) => <BaseIcon {...props}><circle cx="12" cy="8" r="4" /><path d="M6 20c1.5-3 4-4 6-4s4.5 1 6 4" /></BaseIcon>;
export const Search = (props: IconProps) => <BaseIcon {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></BaseIcon>;
export const Zap = (props: IconProps) => <BaseIcon {...props}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" /></BaseIcon>;
export const Crosshair = (props: IconProps) => <BaseIcon {...props}><circle cx="12" cy="12" r="8" /><path d="M12 4v4M12 16v4M4 12h4M16 12h4" /></BaseIcon>;
export const Flame = (props: IconProps) => <BaseIcon {...props}><path d="M12 3c2 3 5 5 5 9a5 5 0 1 1-10 0c0-2 1-4 2.5-5.5.5 2 2 3 2 3 .5-2.5 1.5-4.5.5-6.5z" /></BaseIcon>;
export const AlertTriangle = (props: IconProps) => <BaseIcon {...props}><path d="M12 3 2.5 20h19L12 3z" /><path d="M12 9v4" /><path d="M12 17h.01" /></BaseIcon>;
export const X = (props: IconProps) => <BaseIcon {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></BaseIcon>;
export const TrendingUp = (props: IconProps) => <BaseIcon {...props}><path d="M3 17 9 11l4 4 8-8" /><path d="M14 7h7v7" /></BaseIcon>;
export const TrendingDown = (props: IconProps) => <BaseIcon {...props}><path d="m3 7 6 6 4-4 8 8" /><path d="M14 17h7v-7" /></BaseIcon>;
export const Trophy = (props: IconProps) => <BaseIcon {...props}><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v4a5 5 0 0 1-10 0V4z" /><path d="M5 6H3a2 2 0 0 0 2 2" /><path d="M19 6h2a2 2 0 0 1-2 2" /></BaseIcon>;
export const ArrowRight = (props: IconProps) => <BaseIcon {...props}><path d="M5 12h14" /><path d="m13 5 7 7-7 7" /></BaseIcon>;
export const ArrowUp = (props: IconProps) => <BaseIcon {...props}><path d="m12 19 0-14" /><path d="m5 12 7-7 7 7" /></BaseIcon>;
export const ArrowDown = (props: IconProps) => <BaseIcon {...props}><path d="m12 5 0 14" /><path d="m19 12-7 7-7-7" /></BaseIcon>;
export const Minus = (props: IconProps) => <BaseIcon {...props}><path d="M5 12h14" /></BaseIcon>;
export const ChevronRight = (props: IconProps) => <BaseIcon {...props}><path d="m9 6 6 6-6 6" /></BaseIcon>;
export const Table2 = (props: IconProps) => <BaseIcon {...props}><rect x="3" y="4" width="18" height="16" rx="1" /><path d="M3 10h18M9 4v16M15 4v16" /></BaseIcon>;
export const Loader2 = (props: IconProps) => <BaseIcon {...props}><path d="M21 12a9 9 0 1 1-3-6.7" /></BaseIcon>;
export const WifiOff = (props: IconProps) => <BaseIcon {...props}><path d="m2 2 20 20" /><path d="M8.5 16.5A5 5 0 0 1 12 15c1 0 2 .3 2.8.8" /><path d="M5 12.5A10 10 0 0 1 12 10c3 0 5.7 1.2 7.6 3.1" /><path d="M2.6 8.7A15 15 0 0 1 12 5c4.4 0 8.4 1.9 11.1 4.9" /><path d="M12 20h.01" /></BaseIcon>;
export const Inbox = (props: IconProps) => <BaseIcon {...props}><path d="M4 4h16v11H15l-3 3-3-3H4V4z" /></BaseIcon>;
export const ArrowLeft = (props: IconProps) => <BaseIcon {...props}><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></BaseIcon>;
export const SearchX = (props: IconProps) => <BaseIcon {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /><path d="m9.5 9.5 3 3" /><path d="m12.5 9.5-3 3" /></BaseIcon>;
export const FileWarning = (props: IconProps) => <BaseIcon {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16h16V8z" /><path d="M14 2v6h6" /><path d="M12 12v3" /><path d="M12 18h.01" /></BaseIcon>;
export const Info = (props: IconProps) => <BaseIcon {...props}><circle cx="12" cy="12" r="9" /><path d="M12 10v6" /><path d="M12 7h.01" /></BaseIcon>;
export const ExternalLink = (props: IconProps) => <BaseIcon {...props}><path d="M14 3h7v7" /><path d="M10 14 21 3" /><path d="M20 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6" /></BaseIcon>;
export const Megaphone = (props: IconProps) => <BaseIcon {...props}><path d="m3 11 14-6v14L3 13v-2z" /><path d="M7 13v5" /><path d="M19 8a3 3 0 0 1 0 8" /></BaseIcon>;
export const MessageSquare = (props: IconProps) => <BaseIcon {...props}><path d="M4 5h16v11H8l-4 4V5z" /></BaseIcon>;
export const Send = (props: IconProps) => <BaseIcon {...props}><path d="M3 20 21 12 3 4l3 8-3 8z" /></BaseIcon>;
export const Trash2 = (props: IconProps) => <BaseIcon {...props}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6l1 14h10l1-14" /><path d="M10 10v6M14 10v6" /></BaseIcon>;
export const Flag = (props: IconProps) => <BaseIcon {...props}><path d="M5 3v18" /><path d="M5 4h11l-1 4 1 4H5" /></BaseIcon>;
export const Lock = (props: IconProps) => <BaseIcon {...props}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></BaseIcon>;

/* ─── Shared inline SVG icon components ───
 * Clean line-art icons (1.5px stroke, round caps/joins).
 * Replace ALL emoji usage across the app — import this file.
 */

export type IconSize = 'sm' | 'md' | 'lg';
export type IconColor = 'current' | 'accent' | 'danger' | 'success' | 'muted';

export interface IconProps {
  className?: string;
  size?: number | IconSize;
}

function resolveSize(size?: number | IconSize): number {
  if (typeof size === 'number') return size;
  switch (size) {
    case 'sm': return 14;
    case 'lg': return 22;
    default: return 16;
  }
}

/* ─── Utility — wraps an SVG path into a standard-sized icon ─── */
function SvgIcon({
  viewBox = '0 0 16 16',
  className,
  size,
  children,
}: IconProps & { viewBox?: string; children: React.ReactNode }) {
  const dim = resolveSize(size);
  return (
    <svg
      className={className}
      width={dim}
      height={dim}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/* ⚡ Your turn indicator */
export function IconLightning(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M7 1L3 9h4l-1 6 5-8H7l2-6z" />
    </SvgIcon>
  );
}

/* 🔄 Turn change / refresh */
export function IconRefresh(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M1 8a7 7 0 0 1 13-3.5V2" />
      <path d="M15 8a7 7 0 0 1-13 3.5V14" />
      <path d="M1 12v3h3" />
      <path d="M15 1v3h-3" />
    </SvgIcon>
  );
}

/* 🏆 Winner / trophy */
export function IconTrophy(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M5 14h6" />
      <path d="M8 14V10" />
      <path d="M5 3h6v4a3 3 0 0 1-6 0V3z" />
      <path d="M5 3H3a1 1 0 0 0-1 1v1a2 2 0 0 0 2 2h1" />
      <path d="M11 3h2a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2h-1" />
    </SvgIcon>
  );
}

/* 🔨 Gavel / auction */
export function IconHammer(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M10 6l4-4" />
      <path d="M7 9L3 5l2-2 4 4-2 2z" />
      <path d="M5 7l-3 3" />
      <path d="M4 14h8" />
      <path d="M6 14l-1-4" />
      <path d="M10 14l1-4" />
    </SvgIcon>
  );
}

/* 💼 Investment / briefcase */
export function IconBriefcase(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect x="1" y="5" width="14" height="9" rx="1" />
      <path d="M5 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M1 9a7 7 0 0 0 14 0" />
    </SvgIcon>
  );
}

/* ⚠ Warning / alert */
export function IconWarning(props: IconProps) {
  return (
    <SvgIcon viewBox="0 0 16 16" {...props}>
      <path d="M8 1L1 14h14L8 1z" />
      <path d="M8 6v3" />
      <circle cx="8" cy="11.5" r="0.5" fill="currentColor" stroke="none" />
    </SvgIcon>
  );
}

/* 📉 Chart down / financial decline */
export function IconChartDown(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M1 14l4-5 3 3 6-7" />
      <path d="M12 5h3v3" />
    </SvgIcon>
  );
}

/* 💰 Coins / money */
export function IconCoins(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="8" r="3" />
      <path d="M8 2v1M8 13v1M2 8h1M13 8h1" />
    </SvgIcon>
  );
}

/* 🏢 Building / expansion */
export function IconBuilding(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M2 14V4l6-3v13" />
      <path d="M14 14V7l-3-2" />
      <path d="M2 14h12" />
      <path d="M5 7h2" />
      <path d="M5 10h2" />
      <path d="M10 7h1" />
      <path d="M10 10h1" />
    </SvgIcon>
  );
}

/* ⚔ Swords / combat / takeover */
export function IconSwords(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M14 2l-4 4" />
      <path d="M10 2l4 4" />
      <path d="M12 2H4" />
      <path d="M2 4v8" />
      <path d="M2 4l6 4-6 4" />
      <path d="M14 12H6" />
      <path d="M14 12l-6-4 6-4" />
    </SvgIcon>
  );
}

/* 🛡 Shield / defense */
export function IconShield(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M8 1l6 2v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V3l6-2z" />
      <path d="M5.5 8.5L7 10l3.5-4" />
    </SvgIcon>
  );
}

/* 💀 Skull / elimination */
export function IconSkull(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="8" cy="8" r="6" />
      <circle cx="5.5" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="7" r="1" fill="currentColor" stroke="none" />
      <path d="M5 11a2 2 0 0 0 3 1 2 2 0 0 0 3-1" />
    </SvgIcon>
  );
}

/* 📡 Signal / connection */
export function IconSignal(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M5 10a4 4 0 0 1 6 0" />
      <path d="M3 8a7 7 0 0 1 10 0" />
      <path d="M1 6a10 10 0 0 1 14 0" />
      <circle cx="8" cy="12" r="0.5" fill="currentColor" stroke="none" />
    </SvgIcon>
  );
}

/* ⏰ Clock / timer */
export function IconClock(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4v4l3 2" />
    </SvgIcon>
  );
}

/* 📜 Scroll / document / log */
export function IconScroll(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 2h8v12H4z" />
      <path d="M6 5h4" />
      <path d="M6 8h4" />
      <path d="M6 11h2" />
      <path d="M13 3h1a1 1 0 0 1 1 1v1" />
      <path d="M13 13h1a1 1 0 0 0 1-1v-1" />
    </SvgIcon>
  );
}

/* 📊 Bar chart / stats */
export function IconChart(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M1 14V2" />
      <path d="M5 14V7" />
      <path d="M9 14V5" />
      <path d="M13 14V9" />
      <path d="M1 14h13" />
    </SvgIcon>
  );
}

/* ✦ Decorative bullet / diamond */
export function IconDiamond(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M8 2l5 6-5 6-5-6 5-6z" />
    </SvgIcon>
  );
}

/* Check / success */
export function IconCheck(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M3 8l4 4 7-7" />
    </SvgIcon>
  );
}

/* X close */
export function IconX(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 4l8 8" />
      <path d="M12 4l-8 8" />
    </SvgIcon>
  );
}

/* Arrow right */
export function IconArrowRight(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M2 8h11" />
      <path d="M9 4l4 4-4 4" />
    </SvgIcon>
  );
}

/* Target / scope */
export function IconTarget(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="8" r="3" />
      <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
    </SvgIcon>
  );
}

/* Balance / scale (for LC / finances) */
export function IconScale(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M2 12h12" />
      <path d="M8 12V2" />
      <path d="M8 2l-3 4h6L8 2z" />
      <path d="M4 12a4 4 0 0 0 8 0" />
    </SvgIcon>
  );
}

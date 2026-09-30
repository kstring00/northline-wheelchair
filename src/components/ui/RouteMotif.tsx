/**
 * The brand thread: a pickup dot, a winding road line and a destination pin.
 * Purely decorative (aria-hidden). `data-route-path` / `data-route-end` hooks
 * let the motion layer draw it; with no JS it renders fully drawn.
 */
type Props = {
  className?: string;
  tone?: "light" | "dark";
  /** Attribute placed on the root for animation targeting. */
  hook?: string;
};

export function RouteMotif({ className = "", tone = "light", hook }: Props) {
  const road = tone === "dark" ? "#C9D6E8" : "#1F4570";
  const dot = tone === "dark" ? "#FBF7F0" : "#10284A";
  return (
    <svg
      viewBox="0 0 320 80"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...(hook ? { [hook]: "" } : {})}
    >
      <circle data-route-start cx="12" cy="58" r="8" fill={dot} />
      <circle cx="12" cy="58" r="3" fill={tone === "dark" ? "#10284A" : "#FBF7F0"} />
      <path
        data-route-path
        d="M20 58 C 70 58, 80 22, 140 30 S 220 66, 270 40"
        fill="none"
        stroke={road}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <g data-route-end>
        <path d="M288 6a14 14 0 0 1 14 14c0 10.5-14 24-14 24s-14-13.5-14-24a14 14 0 0 1 14-14z" fill="#F4A340" />
        <circle cx="288" cy="20" r="5" fill="#10284A" />
      </g>
    </svg>
  );
}

/**
 * Lazy GSAP loader. GSAP and its plugins are fetched only by components that
 * animate, after hydration, so they never block first paint or the LCP.
 */
type Plugin = "DrawSVG" | "ScrollTrigger";

export async function loadGsap(plugins: Plugin[] = []) {
  const { gsap } = await import("gsap");
  const loaded: Record<string, unknown> = {};
  if (plugins.includes("DrawSVG")) {
    const { DrawSVGPlugin } = await import("gsap/DrawSVGPlugin");
    gsap.registerPlugin(DrawSVGPlugin);
    loaded.DrawSVGPlugin = DrawSVGPlugin;
  }
  if (plugins.includes("ScrollTrigger")) {
    const { ScrollTrigger } = await import("gsap/ScrollTrigger");
    gsap.registerPlugin(ScrollTrigger);
    loaded.ScrollTrigger = ScrollTrigger;
  }
  gsap.defaults({ ease: "power2.out", duration: 0.35 });
  return { gsap, ...loaded } as { gsap: typeof import("gsap").gsap; ScrollTrigger?: typeof import("gsap/ScrollTrigger").ScrollTrigger };
}

/** Matches GSAP's recommended reduced-motion guard. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

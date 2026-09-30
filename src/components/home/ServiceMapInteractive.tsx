"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Progressive enhancement for the inlined service map (AreasPreview).
 *
 * Without JS the SVG is complete and static. After mount this component:
 *  - draws the freeways and fades the labels in the first time the map
 *    scrolls into view (skipped entirely under prefers-reduced-motion);
 *  - on hover, tap or list-link focus of a core city, highlights it, draws a
 *    dotted route to the Texas Medical Center and shows a chip linking to
 *    that city's page.
 *
 * The chip lives outside the role="img" wrapper so it stays in the
 * accessibility tree; it is positioned over the map from the pin's SVG
 * coordinates (data-x / data-y written by scripts/build-map.ts).
 */

export type MapCity = { slug: string; name: string; hospitals: number };

type Active = { slug: string; left: number; top: number; pinnedByTap: boolean };

const VIEW_W = 1200;
const VIEW_H = 900;
const SVG_NS = "http://www.w3.org/2000/svg";
/** Half the chip's max width (16rem) plus a small margin, in px. */
const CHIP_HALF = 136;

export function ServiceMapInteractive({ cities }: { cities: MapCity[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Active | null>(null);
  const activeRef = useRef<Active | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const wrapper = root?.parentElement?.querySelector<HTMLElement>("[data-service-map]");
    const svg = wrapper?.querySelector<SVGSVGElement>("svg");
    if (!root || !wrapper || !svg) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cityGroups = Array.from(svg.querySelectorAll<SVGGElement>("[data-city]"));
    const routeLayer = svg.querySelector<SVGGElement>("[data-route-layer]");
    const tmc = svg.querySelector<SVGGElement>("[data-tmc]");
    const i45x = Number(svg.dataset.i45X) || VIEW_W / 2;
    const listLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-area-link]"));
    const cleanups: (() => void)[] = [];
    const update = (next: Active | null) => {
      activeRef.current = next;
      setActive(next);
    };

    /* ---------------------------------------------------- entrance motion */
    if (!reduceMotion && "IntersectionObserver" in window) {
      const freeways = Array.from(svg.querySelectorAll<SVGPathElement>("[data-freeway]"));
      const labels = Array.from(svg.querySelectorAll<SVGElement>("[data-label]"));
      // Initial hidden state is set only here, after mount, so no-JS visitors see the finished map.
      for (const p of freeways) {
        p.style.strokeDasharray = "1";
        p.style.strokeDashoffset = "1";
      }
      for (const l of labels) l.style.opacity = "0";

      const timers: number[] = [];
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io.disconnect();
          const groups = Array.from(svg.querySelectorAll<SVGGElement>("[data-freeway-group]"));
          groups.forEach((g, i) => {
            timers.push(
              window.setTimeout(() => {
                for (const p of Array.from(g.querySelectorAll<SVGPathElement>("[data-freeway]"))) {
                  p.style.transition = "stroke-dashoffset 1400ms cubic-bezier(0.22, 0.61, 0.36, 1)";
                  p.style.strokeDashoffset = "0";
                }
              }, i * 120),
            );
          });
          const labelsAt = groups.length * 120 + 900;
          timers.push(
            window.setTimeout(() => {
              for (const l of labels) {
                l.style.transition = "opacity 400ms ease";
                l.style.opacity = "1";
              }
            }, labelsAt),
          );
          // Drop the inline dash state once drawn so hover styling and printing behave normally.
          timers.push(
            window.setTimeout(() => {
              for (const p of freeways) {
                p.style.transition = "";
                p.style.strokeDasharray = "";
                p.style.strokeDashoffset = "";
              }
              for (const l of labels) l.style.transition = "";
            }, labelsAt + 1600),
          );
        },
        { threshold: 0.25 },
      );
      io.observe(wrapper);
      cleanups.push(() => {
        io.disconnect();
        timers.forEach(clearTimeout);
        for (const p of freeways) {
          p.style.transition = "";
          p.style.strokeDasharray = "";
          p.style.strokeDashoffset = "";
        }
        for (const l of labels) {
          l.style.transition = "";
          l.style.opacity = "";
        }
      });
    }

    /* ------------------------------------------------------- city focus */
    // Pin position in wrapper pixels, with the chip kept inside the map's width.
    const toPage = (x: number, y: number) => {
      const rect = svg.getBoundingClientRect();
      const margin = Math.min(CHIP_HALF, rect.width / 2);
      const left = Math.max(margin, Math.min(rect.width - margin, (x / VIEW_W) * rect.width));
      return { left, top: (y / VIEW_H) * rect.height };
    };

    const clearRoute = () => {
      if (routeLayer) routeLayer.replaceChildren();
      for (const g of cityGroups) g.classList.remove("is-active");
    };

    const show = (slug: string, pinnedByTap: boolean) => {
      const group = cityGroups.find((g) => g.dataset.city === slug);
      if (!group) return;
      clearRoute();
      group.classList.add("is-active");

      const x = Number(group.dataset.x);
      const y = Number(group.dataset.y);
      if (routeLayer && tmc) {
        const tx = Number(tmc.dataset.x);
        const ty = Number(tmc.dataset.y);
        // A gentle curve that bends toward I-45, the way most rides actually go.
        const cx = (x + tx) / 2 * 0.35 + i45x * 0.65;
        const cy = (y + ty) / 2;
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", `M${x} ${y - 4} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${tx} ${ty}`);
        path.setAttribute("fill", "none");
        path.style.stroke = "var(--color-cream)";
        path.setAttribute("stroke-opacity", "0.9");
        path.setAttribute("stroke-width", "3");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-dasharray", "0.1 10");
        path.setAttribute("data-route", "");
        routeLayer.appendChild(path);
      }
      const p = toPage(x, y);
      update({ slug, left: p.left, top: p.top, pinnedByTap });
    };

    let hideTimer = 0;
    const hide = (force = false) => {
      window.clearTimeout(hideTimer);
      const run = () => {
        if (!force && activeRef.current?.pinnedByTap) return;
        clearRoute();
        update(null);
      };
      if (force) run();
      else hideTimer = window.setTimeout(run, 120);
    };
    const cancelHide = () => window.clearTimeout(hideTimer);

    for (const g of cityGroups) {
      const slug = g.dataset.city!;
      const onEnter = () => {
        cancelHide();
        show(slug, false);
      };
      const onLeave = () => hide();
      const onClick = (e: Event) => {
        e.preventDefault();
        if (activeRef.current?.slug === slug && activeRef.current.pinnedByTap) hide(true);
        else show(slug, true);
      };
      g.addEventListener("pointerenter", onEnter);
      g.addEventListener("pointerleave", onLeave);
      g.addEventListener("click", onClick);
      cleanups.push(() => {
        g.removeEventListener("pointerenter", onEnter);
        g.removeEventListener("pointerleave", onLeave);
        g.removeEventListener("click", onClick);
      });
    }

    for (const a of listLinks) {
      const slug = a.dataset.areaLink!;
      const onFocus = () => {
        cancelHide();
        show(slug, false);
      };
      const onBlur = () => hide();
      a.addEventListener("focus", onFocus);
      a.addEventListener("blur", onBlur);
      a.addEventListener("pointerenter", onFocus);
      a.addEventListener("pointerleave", onBlur);
      cleanups.push(() => {
        a.removeEventListener("focus", onFocus);
        a.removeEventListener("blur", onBlur);
        a.removeEventListener("pointerenter", onFocus);
        a.removeEventListener("pointerleave", onBlur);
      });
    }

    // Keep the chip over its pin when the map resizes; a tap elsewhere dismisses a pinned chip.
    const onResize = () => {
      const cur = activeRef.current;
      if (cur) show(cur.slug, cur.pinnedByTap);
    };
    const onDocPointer = (e: PointerEvent) => {
      const cur = activeRef.current;
      if (!cur?.pinnedByTap) return;
      const t = e.target as Element | null;
      if (t && (t.closest("[data-city]") || t.closest("[data-map-chip]"))) return;
      hide(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeRef.current) hide(true);
    };
    window.addEventListener("resize", onResize);
    document.addEventListener("pointerdown", onDocPointer);
    document.addEventListener("keydown", onKey);
    const onRootLeave = () => hide();
    root.addEventListener("pointerenter", cancelHide);
    root.addEventListener("pointerleave", onRootLeave);
    cleanups.push(() => {
      root.removeEventListener("pointerenter", cancelHide);
      root.removeEventListener("pointerleave", onRootLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("pointerdown", onDocPointer);
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(hideTimer);
      clearRoute();
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  const city = active ? cities.find((c) => c.slug === active.slug) : undefined;
  const chipText = city
    ? city.hospitals > 0
      ? `${city.name} → ${city.hospitals} ${city.hospitals === 1 ? "hospital" : "hospitals"} we drive to · See ${city.name} rides`
      : `${city.name} → See ${city.name} rides`
    : "";

  return (
    <div ref={rootRef} data-map-chip-root className="pointer-events-none absolute inset-0">
      {active && city && (
        <a
          href={`/service-area/${city.slug}`}
          data-map-chip
          className="pointer-events-auto absolute z-10 inline-block w-max max-w-[16rem] -translate-x-1/2 -translate-y-full rounded-full bg-white px-4 py-2 text-center text-sm font-bold leading-snug text-navy shadow-[var(--shadow-lift)] no-underline hover:bg-morning"
          style={{ left: active.left, top: active.top - 30 }}
        >
          {chipText}
        </a>
      )}
    </div>
  );
}

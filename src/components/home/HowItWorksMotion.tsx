"use client";

import { useEffect } from "react";
import { loadGsap, MOTION_OK } from "@/components/motion/gsap";

export function HowItWorksMotion() {
  useEffect(() => {
    let revert: (() => void) | undefined;
    let cancelled = false;

    loadGsap(["ScrollTrigger"]).then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const list = document.querySelector("[data-how-steps]");
        if (!list) return;
        const lines = list.querySelectorAll("[data-how-line]");
        const lits = list.querySelectorAll("[data-how-lit]");

        // Markers start unlit (text stays full contrast); first lights on entry.
        gsap.set(lits, { scale: 0.4, opacity: 0 });
        gsap.set(lines, { scaleY: 0 });

        const light = (el: Element, on: boolean) =>
          gsap.to(el, { scale: on ? 1 : 0.4, opacity: on ? 1 : 0, duration: 0.3, ease: "power2.out", overwrite: true });

        // One scrubbed timeline draws each segment in order as the reader scrolls.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: list, start: "top 60%", end: "bottom 60%", scrub: 0.6 },
        });
        lines.forEach((line) => tl.to(line, { scaleY: 1, ease: "none", duration: 1 }));

        // Each marker lights when the route reaches it.
        list.querySelectorAll("[data-how-step]").forEach((step, i) => {
          const lit = lits[i];
          if (!lit || !ScrollTrigger) return;
          ScrollTrigger.create({
            trigger: step,
            start: "top 60%",
            onEnter: () => light(lit, true),
            onLeaveBack: () => light(lit, false),
          });
        });
      });
      revert = () => mm.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";
import { loadGsap, MOTION_OK } from "@/components/motion/gsap";

/**
 * Hero moment: the route line draws from pickup to destination once, the pin
 * settles in, then the Book button gets a single soft shine. Headline and
 * photo are never touched. Reduced motion: nothing runs; final state shows.
 */
export function HeroMotion() {
  useEffect(() => {
    let revert: (() => void) | undefined;
    let cancelled = false;

    loadGsap(["DrawSVG"]).then(({ gsap }) => {
      if (cancelled) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const root = document.querySelector("[data-hero-route]");
        const cta = document.querySelector("[data-hero-cta] .shine-bar");
        if (!root) return;
        const tl = gsap.timeline({ delay: 0.25 });
        tl.set(root, { opacity: 1 })
          .from(root.querySelector("[data-route-start]"), { scale: 0, transformOrigin: "50% 50%", duration: 0.3 })
          .from(root.querySelector("[data-route-path]"), { drawSVG: "0%", duration: 1.1, ease: "power1.inOut" }, "-=0.05")
          .from(root.querySelector("[data-route-end]"), { y: -10, opacity: 0, transformOrigin: "50% 100%", duration: 0.35 }, "-=0.15");
        if (cta) {
          // One-time emphasis: a single light sweep across the Book button.
          tl.fromTo(cta, { xPercent: -120 }, { xPercent: 260, duration: 0.8, ease: "power2.inOut" }, "+=0.1");
        }
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

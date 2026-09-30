"use client";

import { useEffect } from "react";
import { loadGsap, MOTION_OK } from "@/components/motion/gsap";

/** Counts each stat up from zero once, when it scrolls into view. SR text is static. */
export function CountUpMotion() {
  useEffect(() => {
    let revert: (() => void) | undefined;
    let cancelled = false;

    loadGsap(["ScrollTrigger"]).then(({ gsap }) => {
      if (cancelled) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const els = document.querySelectorAll<HTMLElement>("[data-countup-value]");
        els.forEach((el) => {
          const target = Number(el.dataset.countupValue);
          const counter = { v: 0 };
          const render = () => (el.textContent = Math.round(counter.v).toLocaleString("en-US"));
          render();
          gsap.to(counter, {
            v: target,
            duration: 1.4,
            ease: "power2.out",
            onUpdate: render,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });
        return () => els.forEach((el) => (el.textContent = Number(el.dataset.countupValue).toLocaleString("en-US")));
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

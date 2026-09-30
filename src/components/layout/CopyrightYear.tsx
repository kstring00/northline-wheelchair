"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Renders the build year in HTML, then the visitor's current year once hydrated. */
export function CopyrightYear({ buildYear }: { buildYear: number }) {
  const year = useSyncExternalStore(subscribe, () => new Date().getFullYear(), () => buildYear);
  return <>{year}</>;
}

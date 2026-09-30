import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "onDark";
type Size = "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-full font-bold no-underline text-center transition-[transform,background-color] duration-200 ease-[var(--ease-gentle)] active:translate-y-px select-none";

const variants: Record<Variant, string> = {
  // Amber appears in three places only: the pin, this button, a route line.
  // Text is Ink (7.1:1 on amber). Hover never introduces another colour.
  primary: "bg-amber text-ink shadow-[0_2px_0_rgb(30_37_51/0.25)] hover:-translate-y-0.5 hover:underline decoration-2 underline-offset-4",
  secondary: "bg-white text-navy border-2 border-navy hover:bg-morning",
  ghost: "text-navy underline decoration-2 hover:bg-morning",
  onDark: "bg-transparent text-cream border-2 border-cream hover:bg-cream/10",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-5 text-base",
  lg: "min-h-14 px-7 text-lg",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

type LinkButtonProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({ variant = "primary", size = "md", className = "", children, ...rest }: LinkButtonProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

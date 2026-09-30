import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "onDark";
type Size = "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-full font-bold no-underline text-center transition-[transform,background-color] duration-200 ease-[var(--ease-gentle)] active:translate-y-px select-none";

const variants: Record<Variant, string> = {
  // Amber is used ONLY for the primary call to action.
  primary: "bg-amber text-navy-950 hover:bg-amber-hover shadow-[0_2px_0_rgb(11_27_51/0.25)]",
  secondary: "bg-white text-navy-900 border-2 border-navy-900 hover:bg-navy-100",
  ghost: "text-navy-900 underline decoration-2 hover:bg-navy-100",
  onDark: "bg-transparent text-cream border-2 border-cream hover:bg-navy-700",
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

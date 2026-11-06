import type { HTMLAttributes } from "react";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

const variants: Record<BadgeVariant, string> = {
  success: "bg-success-light text-success-foreground",
  warning: "bg-warning-light text-warning-foreground",
  error: "bg-error-light text-error-foreground",
  info: "bg-secondary-light text-secondary-light-foreground",
  neutral: "bg-background text-surface-foreground",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  variant = "neutral",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${variants[variant]} ${className}`}
    />
  );
}

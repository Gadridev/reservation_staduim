import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "dark" | "ghost" | "ghost-light" | "danger-outline";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-turf text-chalk hover:bg-turf-light disabled:bg-turf/50",
  dark: "bg-pitch-dark text-cream hover:bg-pitch disabled:bg-pitch-dark/50",
  ghost:
    "bg-transparent text-pitch-dark border border-pitch-dark hover:bg-pitch-dark hover:text-cream",
  "ghost-light":
    "bg-transparent text-cream border border-white/20 hover:bg-white/10",
  "danger-outline":
    "bg-transparent text-danger border border-danger hover:bg-danger hover:text-chalk",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-5 py-3 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}

import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

export function Card({ children, hoverable = false, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`rounded-[14px] border border-line bg-chalk ${
        hoverable ? "transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-lg" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

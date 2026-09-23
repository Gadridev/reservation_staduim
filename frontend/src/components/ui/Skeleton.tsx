import type { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-line/70 ${className}`}
      {...props}
    />
  );
}

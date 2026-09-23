import type { ReactNode } from "react";

export type BadgeStatus = "confirmed" | "pending" | "completed" | "cancelled";

const statusClasses: Record<BadgeStatus, string> = {
  confirmed: "bg-turf/15 text-turf",
  pending: "bg-amber/20 text-amber-deep",
  completed: "bg-indigo-100 text-indigo-600",
  cancelled: "bg-danger/10 text-danger",
};

interface BadgeProps {
  status: BadgeStatus;
  children: ReactNode;
}

export function Badge({ status, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide ${statusClasses[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

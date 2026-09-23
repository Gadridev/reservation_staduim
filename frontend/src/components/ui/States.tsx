interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = "📭", title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-ink-soft">
      <span className="mb-3 text-3xl" aria-hidden="true">
        {icon}
      </span>
      <p className="font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm">{description}</p>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again in a moment.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[14px] border border-danger/20 bg-danger/5 py-14 text-center">
      <p className="font-semibold text-danger">{title}</p>
      <p className="mt-1 text-sm text-ink-soft">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg border border-danger px-4 py-2 text-xs font-bold text-danger hover:bg-danger hover:text-chalk"
        >
          Try again
        </button>
      )}
    </div>
  );
}

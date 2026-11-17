import { useId } from "react";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function EmptyState({
  title = "No hay datos",
  message,
  action,
}: EmptyStateProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col items-center rounded-card border border-surface-border bg-surface px-6 py-10 text-center shadow-sm"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-light">
        <Inbox className="h-6 w-6 text-secondary" aria-hidden />
      </span>
      <h2
        id={titleId}
        className="mt-4 text-h6 text-surface-foreground"
      >
        {title}
      </h2>
      <p className="mt-1 max-w-md text-body text-secondary">{message}</p>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {action.label}
        </button>
      ) : null}
    </section>
  );
}

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
      className="flex flex-col items-center rounded-xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-sterinova-dark/10"
    >
      <Inbox className="h-8 w-8 text-sterinova-teal" aria-hidden />
      <h2
        id={titleId}
        className="mt-3 text-lg font-semibold text-sterinova-dark"
      >
        {title}
      </h2>
      <p className="mt-1 max-w-md text-sm text-secondary">{message}</p>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {action.label}
        </button>
      ) : null}
    </section>
  );
}

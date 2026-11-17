import { AlertCircle } from "lucide-react";

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section
      role="alert"
      aria-live="assertive"
      className="flex flex-col items-center rounded-card border border-error/30 bg-error-light px-6 py-10 text-center"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
        <AlertCircle className="h-6 w-6 text-error" aria-hidden />
      </span>
      <h2 className="mt-4 text-h6 text-surface-foreground">
        No se pudo completar la solicitud
      </h2>
      <p className="mt-1 max-w-md text-body text-surface-subtle">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-control bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
        >
          Reintentar
        </button>
      ) : null}
    </section>
  );
}
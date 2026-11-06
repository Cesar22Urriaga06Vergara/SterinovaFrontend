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
      className="flex flex-col items-center rounded-xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-red-200"
    >
      <AlertCircle className="h-8 w-8 text-red-600" aria-hidden />
      <h2 className="mt-3 text-lg font-semibold text-sterinova-dark">
        No se pudo completar la solicitud
      </h2>
      <p className="mt-1 max-w-md text-sm text-sterinova-dark/80">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-sterinova-teal px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          Reintentar
        </button>
      ) : null}
    </section>
  );
}

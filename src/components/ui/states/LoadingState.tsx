import { LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Cargando..." }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex items-center justify-center gap-3 rounded-card border border-surface-border bg-surface py-10 text-sm font-medium text-secondary"
    >
      <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

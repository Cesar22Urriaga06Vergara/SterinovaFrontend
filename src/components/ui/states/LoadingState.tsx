import { LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Cargando..." }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex items-center justify-center gap-3 py-8 text-sm font-medium text-sterinova-teal"
    >
      <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Error no controlado en la aplicación", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section
        role="alert"
        className="w-full max-w-lg rounded-card border border-error/30 bg-surface p-8 text-center shadow-sm"
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
          <TriangleAlert className="h-6 w-6 text-error" aria-hidden />
        </span>
        <h1 className="mt-4 text-h4 text-surface-foreground">
          Algo salió mal
        </h1>
        <p className="mt-2 text-body text-secondary">
          Ocurrió un error inesperado al cargar esta pantalla. Puedes intentarlo
          de nuevo; si el problema continúa, recarga la página.
        </p>
        <Button className="mt-6" onClick={() => retry()}>
          Reintentar
        </Button>
      </section>
    </main>
  );
}

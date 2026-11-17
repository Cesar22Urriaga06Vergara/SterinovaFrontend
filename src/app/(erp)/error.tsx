"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErpError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Error no controlado en una vista del ERP", error);
  }, [error]);

  return (
    <section
      role="alert"
      className="mx-auto flex max-w-xl flex-col items-center rounded-card border border-error/30 bg-surface px-6 py-10 text-center shadow-sm"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
        <TriangleAlert className="h-6 w-6 text-error" aria-hidden />
      </span>
      <h2 className="mt-4 text-h5 text-surface-foreground">
        No pudimos cargar esta vista
      </h2>
      <p className="mt-2 text-body text-secondary">
        Ocurrió un error inesperado. Puedes intentar de nuevo sin salir de la
        aplicación.
      </p>
      <Button className="mt-6" onClick={() => retry()}>
        Reintentar
      </Button>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";

export const metadata: Metadata = {
  title: "Página no encontrada · Sterinova ERP",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-lg rounded-card border border-surface-border bg-surface p-8 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary-light">
          <SearchX className="h-6 w-6 text-secondary" aria-hidden />
        </span>
        <p className="mt-4 text-caption font-semibold uppercase tracking-wide text-secondary">
          Error 404
        </p>
        <h1 className="mt-1 text-h4 text-surface-foreground">
          Página no encontrada
        </h1>
        <p className="mt-2 text-body text-secondary">
          La dirección que abriste no existe o fue movida.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}

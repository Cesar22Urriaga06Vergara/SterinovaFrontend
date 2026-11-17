"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  FileText,
  Package,
  type LucideIcon,
} from "lucide-react";
import { useSession } from "@/lib/session";
import {
  getComercialAccesses,
  type ComercialAccessId,
} from "@/lib/dashboard";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/states/EmptyState";

const accessIcons: Record<ComercialAccessId, LucideIcon> = {
  clientes: Building2,
  catalogo: Package,
  cotizaciones: FileText,
};

export default function ComercialPageClient() {
  const { permissions, ready } = useSession();
  const accesses = getComercialAccesses(permissions);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <PageHeader
        title="Comercial"
        description="Entrada al trabajo comercial: clientes, catálogo y cotizaciones autorizados para tu sesión."
      />

      {!ready ? (
        <p
          className="rounded-card border border-surface-border bg-surface px-5 py-6 text-sm text-surface-subtle"
          role="status"
        >
          Cargando funciones autorizadas...
        </p>
      ) : accesses.length === 0 ? (
        <EmptyState
          title="Sin funciones comerciales autorizadas"
          message="Tu sesión no tiene permisos comerciales en este ámbito. Si crees que deberías tener acceso, contacta al administrador."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {accesses.map(({ id, title, description, href }) => {
            const Icon = accessIcons[id];
            return (
              <Link
                key={id}
                href={href}
                className="group flex min-h-44 flex-col rounded-card border border-surface-border bg-surface p-7 shadow-sm transition hover:-translate-y-0.5 hover:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span className="inline-flex w-fit rounded-control bg-secondary-light p-2.5 text-secondary">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <div className="mt-5 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-h4 text-surface-foreground">{title}</h2>
                    <p className="mt-1 text-body text-surface-subtle">
                      {description}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="h-5 w-5 shrink-0 text-secondary transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

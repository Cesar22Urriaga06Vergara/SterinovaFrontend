"use client";

import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Factory, Settings, ShieldCheck, Truck } from "lucide-react";
import { useSession } from "@/lib/session";
import { getDashboardSections } from "@/lib/dashboard";

const sectionIcons = {
  comercial: BriefcaseBusiness,
  logistica: Truck,
  planta: Factory,
  calidad: ShieldCheck,
  administracion: Settings,
  documentos: Settings,
} as const;

export default function DashboardClient() {
  const { user, permissions } = useSession();
  const sections = getDashboardSections(permissions);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-sterinova-dark">
          Bienvenido{user?.nombre ? `, ${user.nombre}` : ""}
        </h1>
        <p className="mt-2 text-secondary">
          Accede directamente al trabajo que tienes autorizado.
        </p>
      </section>

      <section aria-labelledby="dashboard-areas-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="dashboard-areas-heading" className="text-xl font-semibold text-sterinova-dark">
              Tus áreas de trabajo
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Cada acceso muestra únicamente funciones disponibles para tu sesión.
            </p>
          </div>
        </div>

        {sections.length === 0 ? (
          <p className="mt-4 rounded-card border border-surface-border bg-surface px-5 py-6 text-sm text-surface-subtle">
            No tienes módulos operativos asignados en este momento.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sections.map(({ id, title, description, href }) => {
              const Icon = sectionIcons[id as keyof typeof sectionIcons];
              return (
                <Link
                  key={id}
                  href={href}
                  className="group rounded-card border border-surface-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <span className="inline-flex rounded-control bg-secondary-light p-2 text-secondary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="mt-5 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-surface-foreground">{title}</h3>
                      <p className="mt-1 text-sm text-surface-subtle">{description}</p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-secondary transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

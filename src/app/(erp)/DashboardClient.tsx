"use client";

import {
  FileText,
  Factory,
  Truck,
  CheckCircle,
} from "lucide-react";
import { useStoredUser } from "@/lib/stored-user-hook";
import { EmptyState } from "@/components/ui/states/EmptyState";

type MetricKey =
  | "pendingQuotes"
  | "plantOrders"
  | "todayDispatches"
  | "certificatesToApprove";

type DashboardMetrics = Record<MetricKey, number | null>;

const metrics: DashboardMetrics = {
  pendingQuotes: null,
  plantOrders: null,
  todayDispatches: null,
  certificatesToApprove: null,
};

const cards: {
  key: MetricKey;
  title: string;
  icon: typeof FileText;
  accent: string;
  ring: string;
}[] = [
  {
    key: "pendingQuotes",
    title: "Cotizaciones Pendientes",
    icon: FileText,
    accent: "text-sterinova-orange",
    ring: "ring-sterinova-orange/20",
  },
  {
    key: "plantOrders",
    title: "Órdenes en Planta",
    icon: Factory,
    accent: "text-sterinova-teal",
    ring: "ring-sterinova-teal/20",
  },
  {
    key: "todayDispatches",
    title: "Despachos Hoy",
    icon: Truck,
    accent: "text-sterinova-dark",
    ring: "ring-sterinova-dark/15",
  },
  {
    key: "certificatesToApprove",
    title: "Certificados por Aprobar",
    icon: CheckCircle,
    accent: "text-sterinova-teal",
    ring: "ring-sterinova-teal/20",
  },
];

export default function DashboardClient() {
  const user = useStoredUser();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-sterinova-dark">
          Bienvenido{user?.nombre ? `, ${user.nombre}` : ""}
        </h1>
        <p className="mt-2 text-secondary">
          Panel principal del Sistema Interno de Gestión Sterinova.
        </p>
      </section>

      {/* TODO: Conectar a endpoint /api/metrics cuando esté disponible en el backend. */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, title, icon: Icon, accent, ring }) => (
          <article
            key={key}
            className={`space-y-4 rounded-xl bg-white p-5 shadow-sm ring-1 ${ring}`}
          >
            <span className={`inline-flex rounded-lg bg-sterinova-light p-2 ${accent}`}>
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            {metrics[key] === null ? (
              <EmptyState title={title} message="Métricas en construcción" />
            ) : (
              <div>
                <h2 className="text-sm font-medium text-sterinova-dark/70">{title}</h2>
                <p className="mt-2 text-3xl font-bold text-sterinova-dark">{metrics[key]}</p>
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}

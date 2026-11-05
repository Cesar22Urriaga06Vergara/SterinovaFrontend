"use client";

import {
  FileText,
  Factory,
  Truck,
  CheckCircle,
} from "lucide-react";
import { useStoredUser } from "@/lib/stored-user-hook";

const cards = [
  {
    title: "Cotizaciones Pendientes",
    value: "12",
    detail: "Esperando respuesta del cliente",
    icon: FileText,
    accent: "text-sterinova-orange",
    ring: "ring-sterinova-orange/20",
  },
  {
    title: "Órdenes en Planta",
    value: "8",
    detail: "Ciclos activos o en proceso",
    icon: Factory,
    accent: "text-sterinova-teal",
    ring: "ring-sterinova-teal/20",
  },
  {
    title: "Despachos Hoy",
    value: "5",
    detail: "Programados en logística",
    icon: Truck,
    accent: "text-sterinova-dark",
    ring: "ring-sterinova-dark/15",
  },
  {
    title: "Certificados por Aprobar",
    value: "3",
    detail: "Pendientes de calidad",
    icon: CheckCircle,
    accent: "text-sterinova-teal",
    ring: "ring-sterinova-teal/20",
  },
];

export default function HomePage() {
  const user = useStoredUser();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-sterinova-dark">
          Bienvenido{user?.nombre ? `, ${user.nombre}` : ""}
        </h1>
        <p className="mt-2 text-sterinova-teal">
          Panel principal del Sistema Interno de Gestión Sterinova.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, value, detail, icon: Icon, accent, ring }) => (
          <article
            key={title}
            className={`rounded-xl bg-white p-5 shadow-sm ring-1 ${ring}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-sterinova-dark/70">
                  {title}
                </p>
                <p className="mt-2 text-3xl font-bold text-sterinova-dark">
                  {value}
                </p>
              </div>
              <span
                className={`rounded-lg bg-sterinova-light p-2 ${accent}`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
            </div>
            <p className="mt-3 text-xs text-sterinova-teal">{detail}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

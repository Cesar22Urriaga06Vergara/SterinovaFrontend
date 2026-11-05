"use client";

import Link from "next/link";
import { BarChart3, Building2, FileText } from "lucide-react";

const links = [
  {
    href: "/comercial/clientes",
    title: "Clientes",
    description: "Administrar clientes y datos de contacto",
    icon: Building2,
  },
  {
    href: "/comercial/cotizaciones",
    title: "Cotizaciones",
    description: "Crear y consultar cotizaciones",
    icon: FileText,
  },
];

export default function ComercialPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-sterinova-dark">
          Dashboard Comercial
        </h1>
        <p className="mt-2 text-sterinova-teal">
          Accede a las herramientas de gestión comercial.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {links.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-56 flex-col rounded-xl bg-white p-7 shadow-sm ring-1 ring-sterinova-dark/10 transition hover:-translate-y-0.5 hover:ring-sterinova-teal"
          >
            <Icon className="h-8 w-8 text-sterinova-orange" aria-hidden />
            <h2 className="mt-5 text-xl font-semibold text-sterinova-dark">
              {title}
            </h2>
            <p className="mt-1 text-sm text-sterinova-teal">{description}</p>
          </Link>
        ))}
        <div
          aria-disabled="true"
          className="flex min-h-56 flex-col rounded-xl bg-sterinova-light p-7 opacity-75 ring-1 ring-sterinova-dark/10"
        >
          <BarChart3 className="h-8 w-8 text-sterinova-teal" aria-hidden />
          <h2 className="mt-5 text-xl font-semibold text-sterinova-dark">
            Reportes
          </h2>
          <p className="mt-1 text-sm text-sterinova-teal">Próximamente</p>
        </div>
      </div>
    </div>
  );
}

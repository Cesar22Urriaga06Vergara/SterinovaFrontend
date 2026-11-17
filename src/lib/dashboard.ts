export type DashboardSection = {
  id: string;
  title: string;
  description: string;
  href: string;
  permissions: readonly string[];
};

const dashboardSections: readonly DashboardSection[] = [
  {
    id: "comercial",
    title: "Comercial",
    description: "Continúa con clientes, catálogo y cotizaciones.",
    href: "/comercial",
    permissions: ["clientes.ver", "productos.gestionar", "cotizaciones.ver"],
  },
  {
    id: "logistica",
    title: "Logística",
    description: "Consulta órdenes y coordina la operación logística.",
    href: "/logistica",
    permissions: ["logistica.ordenes.ver"],
  },
  {
    id: "planta",
    title: "Planta",
    description: "Procesa órdenes y registra ciclos de esterilización.",
    href: "/planta",
    permissions: ["planta.ordenes.ver", "planta.ciclos.ver"],
  },
  {
    id: "calidad",
    title: "Calidad",
    description: "Revisa ciclos y consulta certificados emitidos.",
    href: "/calidad",
    permissions: ["calidad.ciclos.ver", "certificados.ver"],
  },
  {
    id: "administracion",
    title: "Administración",
    description: "Gestiona usuarios y accesos autorizados.",
    href: "/usuarios",
    permissions: ["usuarios.ver"],
  },
  {
    id: "documentos",
    title: "Documentos",
    description: "Gestiona plantillas y sellos documentales autorizados.",
    href: "/configuracion/plantillas",
    permissions: ["formatos.ver", "sellos.ver"],
  },
];

const documentHrefByPermission: Readonly<Record<string, string>> = {
  "formatos.ver": "/configuracion/plantillas",
  "sellos.ver": "/configuracion/sellos",
};

function resolveSectionHref(
  section: DashboardSection,
  permissions: readonly string[],
): string {
  if (section.id !== "documentos") return section.href;

  const authorizedHref = Object.entries(documentHrefByPermission).find(
    ([permission]) => permissions.includes(permission),
  )?.[1];
  return authorizedHref ?? section.href;
}

export function getDashboardSections(
  permissions: readonly string[],
): DashboardSection[] {
  return dashboardSections
    .filter(({ permissions: required }) =>
      required.some((permission) => permissions.includes(permission)),
    )
    .map((section) => ({
      ...section,
      href: resolveSectionHref(section, permissions),
    }));
}

export type ComercialAccessId = "clientes" | "catalogo" | "cotizaciones";

export type ComercialAccess = {
  id: ComercialAccessId;
  title: string;
  description: string;
  href: string;
  permission: string;
};

const comercialAccesses: readonly ComercialAccess[] = [
  {
    id: "clientes",
    title: "Clientes",
    description: "Administra clientes y datos de contacto.",
    href: "/comercial/clientes",
    permission: "clientes.ver",
  },
  {
    id: "catalogo",
    title: "Catálogo",
    description: "Gestiona productos y servicios del catálogo.",
    href: "/comercial/productos",
    permission: "productos.gestionar",
  },
  {
    id: "cotizaciones",
    title: "Cotizaciones",
    description: "Crea, revisa y emite cotizaciones.",
    href: "/comercial/cotizaciones",
    permission: "cotizaciones.ver",
  },
];

export function getComercialAccesses(
  permissions: readonly string[],
): ComercialAccess[] {
  return comercialAccesses.filter(({ permission }) =>
    permissions.includes(permission),
  );
}

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
    permissions: ["planta.ordenes.ver"],
  },
  {
    id: "calidad",
    title: "Calidad",
    description: "Revisa ciclos y consulta certificados emitidos.",
    href: "/calidad",
    permissions: ["calidad.ciclos.ver"],
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

export function getDashboardSections(
  permissions: readonly string[],
): DashboardSection[] {
  return dashboardSections.filter(({ permissions: required }) =>
    required.some((permission) => permissions.includes(permission)),
  );
}

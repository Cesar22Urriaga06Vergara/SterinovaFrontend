export type AppRole = "Admin" | "Comercial" | "Logistica" | "Planta" | "Calidad";

const allRoles: readonly AppRole[] = ["Admin", "Comercial", "Logistica", "Planta", "Calidad"];

export const navigationSections = [
  {
    title: "Principal",
    links: [{ href: "/", label: "Inicio", icon: "home", roles: allRoles }],
  },
  {
    title: "Maestros",
    links: [{ href: "/comercial/clientes", label: "Clientes", icon: "users", permission: "clientes.ver" }],
  },
  {
    title: "Operación",
    links: [
      { href: "/comercial", label: "Panel Comercial", icon: "briefcase", permission: "cotizaciones.ver" },
      { href: "/comercial/cotizaciones", label: "Cotizaciones", icon: "fileText", permission: "cotizaciones.ver" },
      { href: "/logistica", label: "Logística", icon: "truck", permission: "logistica.ordenes.ver" },
      { href: "/planta", label: "Planta", icon: "factory", permission: "planta.ordenes.ver" },
      { href: "/calidad", label: "Calidad", icon: "checkCircle", permission: "calidad.ciclos.ver" },
      { href: "/solicitudes", label: "Solicitudes Pendientes", icon: "fileText", permission: "solicitudes_anulacion.ver" },
    ],
  },
  {
    title: "Administración",
    links: [
      { href: "/usuarios", label: "Usuarios", icon: "users", permission: "usuarios.ver" },
      { href: "/configuracion/plantillas", label: "Plantillas", icon: "settings", permission: "formatos.ver" },
      { href: "/configuracion/sellos", label: "Sellos", icon: "badgeCheck", permission: "sellos.ver" },
    ],
  },
] as const;

export type NavigationIcon = (typeof navigationSections)[number]["links"][number]["icon"];

const roleHome: Record<AppRole, string> = {
  Admin: "/",
  Comercial: "/comercial",
  Logistica: "/logistica",
  Planta: "/planta",
  Calidad: "/calidad",
};

export function isAppRole(value: string | undefined): value is AppRole {
  return Boolean(value && allRoles.includes(value as AppRole));
}

export function getRoleHomePath(role: string | undefined, permissions: readonly string[] = []): string {
  if (!isAppRole(role)) return "/login";
  const preferred = roleHome[role];
  if (canAccessPath(preferred, role, permissions)) return preferred;
  const candidates = ["/comercial", "/logistica", "/planta", "/calidad", "/"];
  return candidates.find((path) => canAccessPath(path, role, permissions)) ?? "/login";
}

export function canAccessPath(pathname: string, role: string | undefined, permissions: readonly string[] = []): boolean {
  if (pathname === "/") return true;
  const pathPermissions: readonly [string, string][] = [
    ["/comercial/clientes", "clientes.ver"],
    ["/comercial/cotizaciones", "cotizaciones.ver"],
    ["/comercial", "cotizaciones.ver"],
    ["/logistica", "logistica.ordenes.ver"],
    ["/planta", "planta.ordenes.ver"],
    ["/calidad", "calidad.ciclos.ver"],
    ["/solicitudes", "solicitudes_anulacion.ver"],
    ["/usuarios", "usuarios.ver"],
    ["/configuracion/plantillas", "formatos.ver"],
    ["/configuracion/sellos", "sellos.ver"],
  ];
  const match = [...pathPermissions]
    .sort(([first], [second]) => second.length - first.length)
    .find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return match ? permissions.includes(match[1]) : isAppRole(role) && pathname === "/";
}

export function getVisibleNavigationSections(role: string | undefined, permissions: readonly string[]) {
  return navigationSections.map((section) => ({
    ...section,
    links: section.links.filter((link) => "permission" in link
      ? permissions.includes(link.permission)
      : link.roles.some((allowedRole) => allowedRole === role)),
  })).filter((section) => section.links.length > 0);
}

export function getActiveNavigationHref(pathname: string, hrefs: readonly string[]): string | null {
  const matches = hrefs.filter((href) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`),
  );

  return matches.sort((first, second) => second.length - first.length)[0] ?? null;
}

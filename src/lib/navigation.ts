export type AppRole = "Admin" | "Comercial" | "Logistica" | "Planta" | "Calidad";

const allRoles: readonly AppRole[] = ["Admin", "Comercial", "Logistica", "Planta", "Calidad"];

export const navigationSections = [
  {
    title: "Principal",
    links: [{ href: "/", label: "Inicio", icon: "home", roles: allRoles }],
  },
  {
    title: "Maestros",
    links: [{ href: "/comercial/clientes", label: "Clientes", icon: "users", roles: ["Admin", "Comercial"] }],
  },
  {
    title: "Operación",
    links: [
      { href: "/comercial", label: "Panel Comercial", icon: "briefcase", roles: ["Admin", "Comercial"] },
      { href: "/comercial/cotizaciones", label: "Cotizaciones", icon: "fileText", roles: ["Admin", "Comercial"] },
      { href: "/logistica", label: "Logística", icon: "truck", roles: ["Admin", "Logistica"] },
      { href: "/planta", label: "Planta", icon: "factory", roles: ["Admin", "Planta"] },
      { href: "/calidad", label: "Calidad", icon: "checkCircle", roles: ["Admin", "Calidad"] },
    ],
  },
  {
    title: "Administración",
    links: [
      { href: "/usuarios", label: "Usuarios", icon: "users", roles: ["Admin"] },
      { href: "/configuracion/plantillas", label: "Plantillas", icon: "settings", roles: ["Admin"] },
      { href: "/configuracion/sellos", label: "Sellos", icon: "badgeCheck", roles: ["Admin"] },
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

const rolePrefixes: Record<Exclude<AppRole, "Admin">, readonly string[]> = {
  Comercial: ["/comercial"],
  Logistica: ["/logistica"],
  Planta: ["/planta"],
  Calidad: ["/calidad"],
};

export function isAppRole(value: string | undefined): value is AppRole {
  return Boolean(value && allRoles.includes(value as AppRole));
}

export function getRoleHomePath(role: string | undefined): string {
  return isAppRole(role) ? roleHome[role] : "/login";
}

export function canAccessPath(pathname: string, role: string | undefined): boolean {
  if (!isAppRole(role)) return false;
  if (role === "Admin") return true;
  if (pathname === "/") return true;
  return rolePrefixes[role].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function getActiveNavigationHref(pathname: string, hrefs: readonly string[]): string | null {
  const matches = hrefs.filter((href) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`),
  );

  return matches.sort((first, second) => second.length - first.length)[0] ?? null;
}

export const navigationSections = [
  {
    title: "Principal",
    links: [{ href: "/", label: "Inicio", icon: "home", session: true }],
  },
  {
    title: "Comercial",
    links: [
      { href: "/comercial/clientes", label: "Clientes", icon: "users", permission: "clientes.ver" },
      { href: "/comercial/productos", label: "Catálogo", icon: "package", permission: "productos.gestionar" },
      { href: "/comercial/cotizaciones", label: "Cotizaciones", icon: "fileText", permission: "cotizaciones.ver" },
    ],
  },
  {
    title: "Operación",
    links: [
      { href: "/logistica", label: "Logística", icon: "truck", permission: "logistica.ordenes.ver" },
      { href: "/logistica/conductores", label: "Conductores", icon: "truck", permission: "logistica.ordenes.ver" },
      { href: "/planta", label: "Planta", icon: "factory", permissions: ["planta.ordenes.ver", "planta.ciclos.ver"] },
      { href: "/calidad", label: "Calidad", icon: "checkCircle", permissions: ["calidad.ciclos.ver", "certificados.ver"] },
      { href: "/calidad/protocolos", label: "Protocolos", icon: "checkCircle", permission: "planta.protocolos.ver" },
    ],
  },
  {
    title: "Gestión",
    links: [
      { href: "/solicitudes", label: "Solicitudes de anulación", icon: "fileText", permission: "solicitudes_anulacion.ver" },
      { href: "/usuarios", label: "Usuarios", icon: "users", permission: "usuarios.ver" },
    ],
  },
  {
    title: "Documentos",
    links: [
      { href: "/configuracion/plantillas", label: "Plantillas", icon: "settings", permission: "formatos.ver" },
      { href: "/configuracion/sellos", label: "Sellos", icon: "badgeCheck", permission: "sellos.ver" },
      { href: "/configuracion/tasas-fiscales", label: "Tasas fiscales", icon: "dollarSign", permission: "tasas_fiscales.gestionar" },
    ],
  },
  {
    title: "Gerencia",
    links: [
      { href: "/gerencia", label: "Métricas", icon: "barChart3", permission: "gerencia.metricas.ver" },
      { href: "/gerencia/administradores", label: "Administradores de área", icon: "users", permission: "gerencia.administradores.gestionar" },
    ],
  },
  {
    title: "Auditoría",
    links: [
      { href: "/auditoria", label: "Eventos de auditoría", icon: "fileText", permission: "auditoria.ver" },
    ],
  },
  {
    title: "Administración",
    links: [
      { href: "/administracion/roles-ambitos", label: "Roles y ámbitos", icon: "shield", globalPermissions: ["ambitos.gestionar", "asignaciones.gestionar"] },
    ],
  },
] as const;

export type NavigationIcon = (typeof navigationSections)[number]["links"][number]["icon"];

function hasRequiredPermission(
  permissions: readonly string[],
  required: string | readonly string[],
): boolean {
  return typeof required === "string"
    ? permissions.includes(required)
    : required.some((permission) => permissions.includes(permission));
}

export function getHomePath(permissions: readonly string[] = []): string {
  if (permissions.includes('usuarios.identidad.gestionar')) return '/';
  return [
    '/comercial',
    '/logistica',
    '/planta',
    '/calidad',
    '/gerencia',
    '/auditoria',
    '/',
  ].find((path) => canAccessPath(path, permissions)) ?? '/';
}

export function canAccessPath(pathname: string, permissions: readonly string[] = [], canManageGlobalRolesOrScopes = false): boolean {
  if (pathname === "/") return true;
  if (pathname === "/administracion/roles-ambitos" || pathname.startsWith("/administracion/roles-ambitos/")) {
    return canManageGlobalRolesOrScopes;
  }
  const pathPermissions: readonly [string, string | readonly string[]][] = [
    ["/comercial/clientes", "clientes.ver"],
    ["/comercial/productos", "productos.gestionar"],
    ["/comercial/cotizaciones", "cotizaciones.ver"],
    ["/comercial", ["clientes.ver", "productos.gestionar", "cotizaciones.ver"]],
    ["/logistica", "logistica.ordenes.ver"],
    ["/logistica/conductores", "logistica.ordenes.ver"],
    ["/planta/ciclo/nuevo", "planta.ciclos.crear"],
    ["/planta", ["planta.ordenes.ver", "planta.ciclos.ver"]],
    ["/calidad/certificados", "certificados.ver"],
    ["/calidad/protocolos", "planta.protocolos.ver"],
    ["/calidad/revisar", "calidad.ciclos.ver"],
    ["/calidad", ["calidad.ciclos.ver", "certificados.ver"]],
    ["/solicitudes", "solicitudes_anulacion.ver"],
    ["/usuarios", "usuarios.ver"],
    ["/configuracion/plantillas", "formatos.ver"],
    ["/configuracion/sellos", "sellos.ver"],
    ["/configuracion/tasas-fiscales", "tasas_fiscales.gestionar"],
    ["/gerencia/administradores", "gerencia.administradores.gestionar"],
    ["/gerencia", "gerencia.metricas.ver"],
    ["/auditoria", "auditoria.ver"],
  ];
  const match = [...pathPermissions]
    .sort(([first], [second]) => second.length - first.length)
    .find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return match ? hasRequiredPermission(permissions, match[1]) : false;
}

export function getVisibleNavigationSections(permissions: readonly string[], canManageGlobalRolesOrScopes = false) {
  return navigationSections.map((section) => ({
    ...section,
    links: section.links.filter((link) => {
      if ("permission" in link) return permissions.includes(link.permission);
      if ("permissions" in link) return hasRequiredPermission(permissions, link.permissions);
      if ("globalPermissions" in link) return canManageGlobalRolesOrScopes;
      return true;
    }),
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

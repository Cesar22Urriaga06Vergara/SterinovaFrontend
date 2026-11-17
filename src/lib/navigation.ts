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
      { href: "/planta", label: "Planta", icon: "factory", permissions: ["planta.ordenes.ver", "planta.ciclos.ver"] },
      { href: "/calidad", label: "Calidad", icon: "checkCircle", permissions: ["calidad.ciclos.ver", "certificados.ver"] },
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
 return ['/comercial','/logistica','/planta','/calidad','/'].find(path => canAccessPath(path, permissions)) ?? '/';
}

export function canAccessPath(pathname: string, permissions: readonly string[] = []): boolean {
  if (pathname === "/") return true;
  const pathPermissions: readonly [string, string | readonly string[]][] = [
    ["/comercial/clientes", "clientes.ver"],
    ["/comercial/productos", "productos.gestionar"],
    ["/comercial/cotizaciones", "cotizaciones.ver"],
    ["/comercial", ["clientes.ver", "productos.gestionar", "cotizaciones.ver"]],
    ["/logistica", "logistica.ordenes.ver"],
    ["/planta/ciclo/nuevo", "planta.ciclos.crear"],
    ["/planta", ["planta.ordenes.ver", "planta.ciclos.ver"]],
    ["/calidad/certificados", "certificados.ver"],
    ["/calidad/revisar", "calidad.ciclos.ver"],
    ["/calidad", ["calidad.ciclos.ver", "certificados.ver"]],
    ["/solicitudes", "solicitudes_anulacion.ver"],
    ["/usuarios", "usuarios.ver"],
    ["/configuracion/plantillas", "formatos.ver"],
    ["/configuracion/sellos", "sellos.ver"],
  ];
  const match = [...pathPermissions]
    .sort(([first], [second]) => second.length - first.length)
    .find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return match ? hasRequiredPermission(permissions, match[1]) : false;
}

export function getVisibleNavigationSections(permissions: readonly string[]) {
  return navigationSections.map((section) => ({
    ...section,
    links: section.links.filter((link) => {
      if ("permission" in link) return permissions.includes(link.permission);
      if ("permissions" in link) return hasRequiredPermission(permissions, link.permissions);
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

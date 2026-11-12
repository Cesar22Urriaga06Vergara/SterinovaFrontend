# Navegación y permisos visibles

> **Estado:** vigente.
> **Verificado contra:** `src/app`, `src/lib/navigation.ts`, sesión y `src/components/Sidebar.tsx` el 12 de noviembre de 2026.
> **Alcance:** rutas de página y visibilidad de enlaces en frontend.
> **No cubre:** autorización efectiva del API, despliegue ni acceso observado en navegador.
> **Fuente canónica de:** reglas de visibilidad de navegación por permiso.

`src/lib/navigation.ts` declara los permisos requeridos por cada enlace. `SessionProvider` obtiene la sesión validada desde `/auth/me`; `Sidebar.tsx` filtra por sus permisos, sin consultar un rol guardado localmente. `src/app/(erp)/layout.tsx` valida la sesión antes de mostrar las vistas. La visibilidad sigue siendo una ayuda de navegación, no una barrera de seguridad: la API vuelve a comprobar permisos, ámbitos y reglas de negocio.

La matriz de responsabilidades visuales por vista se mantiene en
[auditoría de vistas y roles](../superpowers/audits/2026-11-12-matriz-vistas-roles.md).
Ese documento también registra qué acciones pertenecen a cada página y qué
estados debe presentar la interfaz.

> **Fuente canónica:** las rutas frontend se detallan en [módulos y rutas](../estado-proyecto/modulos.md); las reglas de autenticación/autorización API en [arquitectura backend](../../../Sterinova-Backend/docs/arquitectura/arquitectura-y-stack.md). Esta página solo describe visibilidad y navegación.

Las rutas funcionales y la distinción de páginas internas PDF están listadas en [módulos y rutas](../estado-proyecto/modulos.md); esta página no mantiene una segunda lista de rutas.

Cada enlace aparece cuando la sesión contiene el permiso declarado para esa ruta; por ejemplo, Usuarios requiere `usuarios.ver`, Solicitudes requiere `solicitudes_anulacion.ver` y Sellos requiere `sellos.ver`. El texto o nombre de un perfil, incluido «Admin», no concede acceso por sí solo. La UI puede ocultar un enlace, pero no sustituye la autorización del API.

# Módulos visibles en la interfaz

Este inventario describe rutas visibles en el código del frontend; la existencia de una pantalla no garantiza que el flujo esté completo en backend o producción.

- La navegación separa Clientes bajo **Maestros** y Cotizaciones, Logística, Planta y Calidad bajo **Operación**. Catálogos sin ruta de frontend y opciones de configuración sin pantalla no se muestran como enlaces activos.
- Acceso: pantalla de inicio de sesión.
- Comercial: clientes y cotizaciones.
- Logística: órdenes de servicio y seguimiento.
- Planta: consulta de órdenes y registro de ciclos.
- Calidad: revisión de ciclos y vistas de certificados en desarrollo.

Verifica la API y los permisos correspondientes antes de considerar un módulo listo para operación.
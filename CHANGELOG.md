# Changelog

Los cambios importantes de este proyecto se registran aquí.

## [1.0.0] - 2026-11-06

### Añadido

- Design System con tokens semánticos y componentes UI reutilizables para las vistas piloto.
- Suite E2E con Playwright para login, creación de cotizaciones (incluidos los siete tipos), aprobación de Calidad, manejo de error/reintento y descarga PDF con API simulada.
- Documentación de contribución frontend, guía de patrones UI, plantilla de pull request y reporte de cierre de fases.

### Mejorado

- Accesibilidad automatizada de las tres vistas piloto — Login, Dashboard y Calidad — con Lighthouse Accessibility 100/100 en las ejecuciones documentadas. El resultado se limita a esas rutas y no constituye una certificación WCAG.
- Estados de carga, error, vacío, reintento y confirmación en los flujos implementados.
- Compatibilidad de importación de Excel mediante la distribución actualizada de SheetJS mantenida por la comunidad.

### Calidad

- `npm run test`: 40 pruebas aprobadas.
- `npm run test:e2e`: 4 pruebas aprobadas en Chromium headless.
- `npm run build`: compilación de producción aprobada.

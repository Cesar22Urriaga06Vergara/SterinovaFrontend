# Reporte de ejecución — Fase 3: Módulos críticos

> **Estado:** completada.
> **Repositorio:** `frontend_sterinova`.
> **Verificación:** 6 de noviembre de 2026.

## Cotizaciones: tipos alineados con el backend

El selector de Nueva Cotización presenta los siete tipos y muestra el prefijo junto a cada opción:

| Tipo | Prefijo |
|---|---|
| Industrial EtO (`INDUSTRIAL_ETO`) | `COT-IND-` |
| Institucional EtO (`INSTITUCIONAL_ETO`) | `COT-CME-` |
| Institucional Vapor (`INSTITUCIONAL_VAPOR`) | `COT-CME-` |
| Insumos (`INSUMOS`) | `COT-CMI-` |
| Lavandería (`LAVANDERIA`) | `COT-LAV-` |
| Farmacéutico (`FARMACEUTICO`) | `COT-CEMFA-` |
| Fabricante (`FABRICANTE`) | `COT-CMED-` |

Los prefijos corresponden al mapa del backend. Los dos tipos nuevos también están disponibles en la administración de plantillas y en los datos de renderizado de PDF. No se asignaron códigos documentales oficiales que el backend no hubiera proporcionado.

## Dashboard

Se eliminaron la etiqueta de demo y el retardo de carga simulado. Las cuatro tarjetas muestran `EmptyState` con el mensaje **“Métricas en construcción”**, respaldadas por una estructura tipada preparada para valores reales. El backend revisado no expone un endpoint de métricas; se dejó el TODO para conectar `/api/metrics` cuando exista, sin emitir solicitudes fallidas ni presentar contadores inventados.

## Calidad

- **Aprobar:** se solicita la contraseña del aprobador en un modal accesible y se envía al endpoint de aprobación. Si la API rechaza la contraseña, el mensaje se conserva en el modal y el cliente Axios lo notifica mediante el `ToastProvider`.
- **Rechazar:** no se envía el formulario si el motivo está vacío o contiene solo espacios. Se recorta antes de enviarlo y se limita a 2.000 caracteres, según el DTO del backend.

## Usuarios

El formulario de creación ya existía; se reforzó con validaciones previas al envío y errores específicos junto a nombre, correos y contraseña. La creación y el cambio de contraseña exigen mínimo 10 caracteres, igual que el backend. No se añadieron requisitos de mayúscula o número porque el contrato actual no los exige. Los errores de correo opcional y obligatorio se presentan junto a su campo.

## Quality Gate

- `npm run build`: **correcto**.
- `node --test tests/*.test.mjs`: **31 aprobadas, 0 fallidas**. El total supera las 23 pruebas del plan inicial porque se añadieron pruebas para los contratos y flujos de esta fase.
- ESLint dirigido a los módulos modificados: **correcto**.
- Verificación visual en navegador: **no ejecutada**; requiere una sesión autenticada y servicios API disponibles.

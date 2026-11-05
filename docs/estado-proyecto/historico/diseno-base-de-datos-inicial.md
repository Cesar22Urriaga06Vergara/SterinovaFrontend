> **Borrador histórico de diseño.** Este documento refleja una propuesta inicial y no describe el esquema actual. Consulta la documentación de base de datos del backend.

# 🗄️ Base de Datos (MariaDB)

**Nombre de la Base de Datos:** `sterinova` (Debe ser creada previamente en HeidiSQL).
**Cotejamiento:** `utf8mb4_general_ci`.

## Reglas de Arquitectura de Base de Datos

- **Prohibido el uso de UUID.** Todas las entidades (tablas) deben usar `@PrimaryGeneratedColumn()` (numérico autoincremental) para sus IDs.
- Las llaves primarias (`id`) son enteros autoincrementales (`1, 2, 3...`).
- Las llaves foráneas también deben ser de tipo numérico (`number` en TypeScript / `INT` en MariaDB).

## Entidades Principales (TypeORM creará estas tablas)

1.  **usuarios:** id, nombre, email, password_hash, rol (Admin, Comercial, Logistica, Planta, Calidad), firma_digital_url.
2.  **clientes:** id, nit, razon_social, contacto, telefono, email, direccion.
3.  **cotizaciones:** id, consecutivo (AUTO_INCREMENT), cliente_id, fecha, estado.
4.  **ordenes_servicio:** id, consecutivo, cotizacion_id, tipo_servicio (EtO, Vapor, Lavanderia), estado.
5.  **ciclos_esterilizacion:** id, orden_id, operador_id, equipo, metodo, temperatura, humedad, presion, tiempo_exposicion, tiempo_aireacion, controles biologicos y quimicos, fecha_proceso, estado.
6.  **certificados_esterilizacion:** id, consecutivo, orden_id, equipo, ciclo, fechas, parametros_tecnicos (JSON o columnas separadas), controles_biologicos, estado (Borrador, Aprobado, Anulado), firmas.

## Reglas Críticas de SQL (Triggers a implementar)
Para garantizar la seguridad regulatoria, se deben crear Triggers en MariaDB:
1.  **Bloqueo de Consecutivos:** El campo consecutivo debe ser `UNIQUE` y `NOT NULL`.
2.  **Trigger de Inmutabilidad:** Si un registro en `certificados_esterilizacion` tiene estado `Aprobado`, cualquier consulta `UPDATE` debe ser rechazada por la base de datos arrojando un error.

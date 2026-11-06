# Desarrollo local del frontend

> **Estado:** vigente.
> **Verificado contra:** scripts, cliente API y configuración frontend el 6 de noviembre de 2026.
> **Alcance:** arranque local e integración local con el backend.
> **No cubre:** configuración de despliegue ni secretos.

## Requisitos y arranque

- Node.js y npm.
- Backend Sterinova con MariaDB disponible en `http://localhost:3001` para usar los flujos integrados.

```powershell
npm install
npm run dev
```

Abre `http://localhost:3000`.

## URL de API

El cliente Axios utiliza `NEXT_PUBLIC_API_URL`; si no se define, usa `http://localhost:3001`. El formulario de login todavía llama a `http://localhost:3001/auth/login` directamente, de modo que cambiar la variable no cambia esa llamada. Configura backend y frontend de manera compatible.

Para renderizado oficial de PDFs, el frontend debe ser accesible desde el backend por `PDF_RENDER_BASE_URL` o `FRONTEND_INTERNAL_URL`, y ambos entornos necesitan el mismo `PDF_RENDER_SECRET` privado. Consulta [integración](../arquitectura/integracion-y-stack.md) y el [manual local del backend](../../../backend_sterinova/docs/manuales/configuracion-local.md).

No guardes credenciales ni secretos en archivos versionados.

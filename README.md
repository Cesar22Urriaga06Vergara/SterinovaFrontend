# Sterinova ERP — Frontend

Interfaz web del ERP, construida con Next.js, React y TypeScript.

## Requisitos

- Node.js 22.x (ver `.nvmrc` o `nvm use 22`) y npm 10.x.
- Backend disponible en http://localhost:3001.
- Archivo `.env` basado en `.env.example` con `NEXT_PUBLIC_API_URL` configurado.

## Inicio local

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Abre http://localhost:3000. La URL base del cliente API se configura con `NEXT_PUBLIC_API_URL`; por defecto es `http://localhost:3001`.

## Comandos útiles

- npm run build: genera la compilación de producción.
- npm run start: sirve la compilación.
- npm run lint: ejecuta ESLint.

## Documentación

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para commits, componentes, accesibilidad y pruebas; usa la [plantilla de pull request](.github/PULL_REQUEST_TEMPLATE.md) al proponer cambios. El [índice de documentación](docs/README.md) reúne arquitectura, desarrollo local, UI/UX y estado del proyecto.

Las reglas de negocio oficiales y la documentación de arquitectura viven en el repositorio Backend. Consulta [las reglas de negocio](../Sterinova-Backend/docs/negocio/) y [la arquitectura](../Sterinova-Backend/docs/arquitectura/) para más detalles.

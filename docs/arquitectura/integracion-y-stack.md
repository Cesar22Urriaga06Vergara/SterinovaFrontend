# Arquitectura e integración del frontend

La interfaz usa Next.js 16, React 19 y TypeScript. Está organizada en rutas de la aplicación y consume la API REST NestJS del proyecto backend_sterinova.

El cliente Axios usa NEXT_PUBLIC_API_URL como URL base, con valor predeterminado http://localhost:3001. El flujo de inicio de sesión y las solicitudes autenticadas dependen de que el backend esté disponible.

Los recursos estáticos usados por los PDFs se sirven desde public/. Logo1.png permanece allí y los componentes lo referencian como /Logo1.png.

Consulta el [manual de desarrollo local](../manuales/desarrollo-local.md).
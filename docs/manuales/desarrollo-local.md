# Desarrollo local del frontend

## Requisitos

Instala Node.js y npm. Para usar los flujos que consultan datos, inicia también el backend Sterinova en http://localhost:3001.

## Instalación y arranque

~~~powershell
npm install
npm run dev
~~~

Abre http://localhost:3000.

## URL de la API

El cliente API utiliza NEXT_PUBLIC_API_URL; si no se define, usa http://localhost:3001. No guardes credenciales ni secretos en archivos versionados.
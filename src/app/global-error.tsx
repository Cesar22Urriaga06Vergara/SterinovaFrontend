"use client";

import { useEffect } from "react";

const buttonStyle = {
  marginTop: "1.5rem",
  minHeight: "2.5rem",
  border: 0,
  borderRadius: "0.5rem",
  background: "#0a464c",
  color: "#ffffff",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.875rem",
  fontWeight: 600,
  padding: "0.5rem 1rem",
};

export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Error no controlado en el layout raíz", error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f6f8",
          color: "#1e293b",
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "1rem",
        }}
      >
        <title>Error · Sterinova ERP</title>
        <main
          style={{
            width: "100%",
            maxWidth: "32rem",
            border: "1px solid #dce3e8",
            borderRadius: "0.75rem",
            background: "#ffffff",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "0 1px 2px rgb(0 0 0 / 0.05)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "1.25rem" }}>
            La aplicación no pudo iniciar
          </h1>
          <p
            style={{
              margin: "0.5rem 0 0",
              color: "#475569",
              fontSize: "0.875rem",
              lineHeight: 1.5,
            }}
          >
            Ocurrió un error inesperado. Intenta de nuevo; si persiste, recarga
            la página o contacta al administrador.
          </p>
          <button type="button" onClick={() => retry()} style={buttonStyle}>
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}

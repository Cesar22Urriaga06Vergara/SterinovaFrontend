"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BrandLogo } from "@/components/BrandLogo";

export default function ResetPasswordPage() {
  const token = useRef("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token.current) {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      token.current = fragment.get("token") ?? "";
    }
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!token.current) {
      setError("El enlace de restablecimiento no es válido.");
      return;
    }
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL.replace(/\/+$/, "")}/auth/password/reset`, {
        token: token.current,
        password,
      });
      setComplete(true);
      token.current = "";
      setPassword("");
      setConfirmation("");
    } catch (resetError) {
      setError(getApiErrorMessage(resetError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <section className="w-full max-w-md space-y-5 rounded-dialog border border-surface-border bg-surface p-6 shadow-lg sm:p-8">
        <div className="text-center">
          <BrandLogo />
          <h1 className="mt-5 text-h3 text-surface-foreground">Restablecer contraseña</h1>
        </div>
        {complete ? (
          <div role="status" className="space-y-4 text-center">
            <p>La contraseña se actualizó. Las sesiones anteriores fueron invalidadas.</p>
            <a className="rounded-control font-semibold text-secondary underline hover:text-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2" href="/login">Ir al inicio de sesión</a>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Input
              id="new-password"
              label="Nueva contraseña"
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Input
              id="confirm-password"
              label="Confirmar contraseña"
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
            {error ? <p role="alert" className="text-sm font-medium text-error">{error}</p> : null}
            <Button type="submit" loading={loading} loadingLabel="Actualizando..." className="w-full">
              Actualizar contraseña
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}

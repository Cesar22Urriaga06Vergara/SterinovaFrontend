"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { notifyToast } from "@/components/ui/states/toast-events";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submitLock = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current) return;
    submitLock.current = true;
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_BASE_URL.replace(/\/+$/, "")}/auth/login`,
        { email, password },
      );

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      notifyToast("Sesión iniciada correctamente.", "success");
      router.push("/");
    } catch (loginError) {
      setError(getApiErrorMessage(loginError));
    } finally {
      submitLock.current = false;
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-sterinova-light px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-sterinova-dark/10">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-secondary uppercase">
            Sterinova
          </p>
          <h1 className="mt-2 text-3xl font-bold text-sterinova-dark">
            Sterinova ERP
          </h1>
          <p className="mt-2 text-sm text-secondary">
            Sistema Interno de Gestión
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@sterinova.co"
          />

          <Input
            id="password"
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            loading={loading}
            loadingLabel="Ingresando..."
            className="w-full"
          >
            Ingresar al Sistema
          </Button>

          {error ? (
            <p className="text-center text-sm font-medium text-error" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </div>
    </main>
  );
}

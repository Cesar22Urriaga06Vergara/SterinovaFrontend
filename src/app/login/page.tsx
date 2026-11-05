"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post("http://localhost:3001/auth/login", {
        email,
        password,
      });

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch {
      setError("Credenciales inválidas. Verifica tu email y contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sterinova-light px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-sterinova-dark/10">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-sterinova-teal uppercase">
            Sterinova
          </p>
          <h1 className="mt-2 text-3xl font-bold text-sterinova-dark">
            Sterinova ERP
          </h1>
          <p className="mt-2 text-sm text-sterinova-teal">
            Sistema Interno de Gestión
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-sterinova-dark"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-3.5 py-2.5 text-sterinova-dark outline-none transition focus:border-sterinova-teal focus:ring-2 focus:ring-sterinova-teal/30"
              placeholder="admin@sterinova.co"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-sterinova-dark"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-3.5 py-2.5 text-sterinova-dark outline-none transition focus:border-sterinova-teal focus:ring-2 focus:ring-sterinova-teal/30"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-sterinova-orange px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Ingresando..." : "Ingresar al Sistema"}
          </button>

          {error ? (
            <p className="text-center text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}

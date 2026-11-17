"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { notifyToast } from "@/components/ui/states/toast-events";
import { BrandLogo } from "@/components/BrandLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="min-h-svh bg-surface lg:grid lg:grid-cols-[45%_55%]">
      <section aria-labelledby="login-heading" className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-br from-[#fafcfc] via-[#f3f8f7] to-[#e8f2f1] px-6 py-10 sm:px-10 lg:px-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_24%,rgba(13,119,122,0.08),transparent_58%)]" />
      <div className="w-full max-w-sm">
        <div className="mb-9 text-center">
          <div className="mx-auto w-36 mix-blend-multiply"><BrandLogo stacked /></div>
          <h1 id="login-heading" className="mt-8 text-3xl font-semibold tracking-tight text-surface-foreground">
            Inicia sesión
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-surface-subtle">
            Accede a tu espacio de trabajo en Sterinova.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="email"
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-h-12"
            startAdornment={<Mail className="h-4 w-4" aria-hidden />}
          />

          <Input
            id="password"
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="min-h-12 pr-28"
            startAdornment={<LockKeyhole className="h-4 w-4" aria-hidden />}
            endAdornment={
              <button
                type="button"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
                aria-controls="password"
                onClick={() => setShowPassword((visible) => !visible)}
                className="mr-1 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-control px-3 text-xs font-medium text-surface-subtle transition-colors hover:bg-background hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                <span>{showPassword ? "Ocultar" : "Mostrar"}</span>
              </button>
            }
          />

          <Button
            type="submit"
            loading={loading}
            loadingLabel="Ingresando..."
            className="group min-h-12 w-full shadow-sm transition-shadow hover:shadow-md motion-reduce:transition-none"
          >
            Ingresar
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
          </Button>

          {error ? (
            <p className="text-center text-sm font-medium text-error" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </div>
      </section>
      <aside aria-label="Nuestro equipo" className="relative hidden min-h-svh overflow-hidden bg-sterinova-dark lg:flex lg:flex-col lg:justify-center lg:px-10 lg:py-14 xl:px-14">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#092c33] via-transparent to-transparent" />
        <div className="relative w-full">
          <div className="relative aspect-[2/1] w-full overflow-hidden rounded-control">
            <Image
              src="/Integrantes.jpg"
              alt="Equipo de Sterinova y su flota de vehículos"
              fill
              sizes="55vw"
              className="object-contain"
            />
          </div>
          <div className="mt-10 border-l-2 border-sterinova-orange pl-5">
            <p className="text-sm text-white/80">Nuestro equipo</p>
            <p className="mt-2 max-w-md text-3xl font-semibold leading-tight text-white xl:text-4xl">
              Aseguramiento en esterilización
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80">
              Esterilización y soluciones para el sector salud y farmacéutico.
            </p>
          </div>
        </div>
      </aside>
    </main>
  );
}

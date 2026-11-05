"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { MetodoEsterilizacion } from "@/lib/planta-types";

const initialForm = {
  equipo: "",
  metodo: "ETO" as MetodoEsterilizacion,
  temperatura: "",
  humedad: "",
  presion: "",
  tiempo_exposicion: "",
  tiempo_aireacion: "",
  control_biologico: "",
  control_quimico: "",
};

const numberFields = [
  ["temperatura", "Temperatura"],
  ["humedad", "Humedad"],
  ["presion", "Presión"],
  ["tiempo_exposicion", "Tiempo de Exposición"],
  ["tiempo_aireacion", "Tiempo de Aireación"],
] as const;

export default function NuevoCicloPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ordenId = searchParams.get("orden_id");
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ordenId || !Number.isInteger(Number(ordenId)) || Number(ordenId) < 1) {
      setError("No se recibió una orden válida para registrar el ciclo.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await api.post("/planta/ciclos", {
        orden_id: Number(ordenId),
        equipo: form.equipo,
        metodo: form.metodo,
        temperatura: Number(form.temperatura),
        humedad: Number(form.humedad),
        presion: Number(form.presion),
        tiempo_exposicion: Number(form.tiempo_exposicion),
        tiempo_aireacion: Number(form.tiempo_aireacion),
        control_biologico: form.control_biologico,
        control_quimico: form.control_quimico,
      });
      setSuccess("Ciclo registrado correctamente.");
      window.setTimeout(() => router.push("/planta?ciclo=registrado"), 700);
    } catch {
      setError("No se pudo registrar el ciclo. Verifica los datos y el estado de la orden.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <Link href="/planta" className="text-sm font-medium text-sterinova-teal hover:underline">
          ← Volver a Planta
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-sterinova-dark">
          Registrar Ciclo de Esterilización
        </h1>
        <p className="mt-1 text-sterinova-teal">Orden #{ordenId ?? "—"}</p>
      </div>

      {success ? (
        <p className="text-sm font-medium text-green-700" role="status">{success}</p>
      ) : null}
      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">{error}</p>
      ) : null}

      <form onSubmit={handleSubmit} className="grid gap-5 rounded-xl bg-white p-6 shadow-sm ring-1 ring-sterinova-dark/10 sm:grid-cols-2">
        <label htmlFor="equipo" className="space-y-1 text-sm font-medium text-sterinova-dark sm:col-span-2">
          Equipo
          <input
            id="equipo"
            name="equipo"
            required
            value={form.equipo}
            onChange={(event) => setForm((current) => ({ ...current, equipo: event.target.value }))}
            placeholder="CICLO 10M68"
            className="w-full rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-3 py-2 font-normal outline-none focus:border-sterinova-teal"
          />
        </label>

        <label htmlFor="metodo" className="space-y-1 text-sm font-medium text-sterinova-dark">
          Método
          <select
            id="metodo"
            name="metodo"
            value={form.metodo}
            onChange={(event) => setForm((current) => ({ ...current, metodo: event.target.value as MetodoEsterilizacion }))}
            className="w-full rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-3 py-2 font-normal outline-none focus:border-sterinova-teal"
          >
            <option value="ETO">EtO</option>
            <option value="VAPOR">Vapor</option>
          </select>
        </label>

        {numberFields.map(([key, label]) => (
          <label key={key} htmlFor={key} className="space-y-1 text-sm font-medium text-sterinova-dark">
            {label}
            <input
              id={key}
              name={key}
              required
              type="number"
              min="0"
              step="any"
              value={form[key]}
              onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              className="w-full rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-3 py-2 font-normal outline-none focus:border-sterinova-teal"
            />
          </label>
        ))}

        <label htmlFor="control_biologico" className="space-y-1 text-sm font-medium text-sterinova-dark">
          Control Biológico
          <input
            id="control_biologico"
            name="control_biologico"
            required
            value={form.control_biologico}
            onChange={(event) => setForm((current) => ({ ...current, control_biologico: event.target.value }))}
            placeholder="Negativo"
            className="w-full rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-3 py-2 font-normal outline-none focus:border-sterinova-teal"
          />
        </label>

        <label htmlFor="control_quimico" className="space-y-1 text-sm font-medium text-sterinova-dark">
          Control Químico
          <input
            id="control_quimico"
            name="control_quimico"
            required
            value={form.control_quimico}
            onChange={(event) => setForm((current) => ({ ...current, control_quimico: event.target.value }))}
            placeholder="Cambio de color"
            className="w-full rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-3 py-2 font-normal outline-none focus:border-sterinova-teal"
          />
        </label>

        <div className="flex justify-end gap-3 sm:col-span-2">
          <Link href="/planta" className="rounded-lg px-4 py-2 text-sm font-medium text-sterinova-dark hover:bg-sterinova-light">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-sterinova-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
          >
            {saving ? "Guardando..." : "Registrar Ciclo"}
          </button>
        </div>
      </form>
    </div>
  );
}

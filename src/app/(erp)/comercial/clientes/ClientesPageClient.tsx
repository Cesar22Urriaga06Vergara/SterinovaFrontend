"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Pencil, Plus, Upload, X } from "lucide-react";
import * as XLSX from "xlsx";
import { api } from "@/lib/api";
import type { Cliente } from "@/lib/cliente-types";
import {
  ClienteImportacion,
  mapClienteExcelRow,
} from "@/lib/cliente-import";

const emptyForm = {
  razon_social: "",
  nit: "",
  contacto: "",
  telefono: "",
  email: "",
  direccion: "",
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadClientes() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<Cliente[]>("/clientes");
      setClientes(data);
    } catch {
      setError("No se pudieron cargar los clientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    api
      .get<Cliente[]>("/clientes")
      .then(({ data }) => {
        if (active) setClientes(data);
      })
      .catch(() => {
        if (active) setError("No se pudieron cargar los clientes.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingCliente) {
        await api.put(`/clientes/${editingCliente.id}`, form);
        setSuccess("Cliente actualizado correctamente.");
      } else {
        await api.post("/clientes", form);
        setSuccess("Cliente creado correctamente.");
      }
      setForm(emptyForm);
      setEditingCliente(null);
      setModalOpen(false);
      await loadClientes();
    } catch {
      setError(
        editingCliente
          ? "No se pudo actualizar el cliente."
          : "No se pudo crear el cliente.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleExcelImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError("");
    setSuccess("");
    try {
      if (!/\.(xlsx|xls)$/i.test(file.name)) {
        throw new Error("Selecciona un archivo Excel .xlsx o .xls.");
      }

      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error("El archivo no contiene hojas para importar.");
      }

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        workbook.Sheets[firstSheetName],
        { defval: "" },
      );
      if (rows.length === 0) {
        throw new Error("La hoja seleccionada no contiene clientes.");
      }

      const clients: ClienteImportacion[] = rows.map((row, index) => {
        const cliente = mapClienteExcelRow(row);
        if (!cliente.razon_social || !cliente.nit) {
          const missingFields = [
            !cliente.razon_social ? "razon_social (CLIENTE)" : "",
            !cliente.nit ? "nit (ID)" : "",
          ].filter(Boolean);
          throw new Error(
            `La fila ${index + 2} tiene campos vacíos: ${missingFields.join(", ")}.`,
          );
        }

        return cliente;
      });

      const { data } = await api.post<{ imported: number; skipped: number }>(
        "/clientes/bulk",
        clients,
      );
      const skippedMessage =
        data.skipped > 0 ? ` Se omitieron ${data.skipped} por NIT duplicado.` : "";
      setSuccess(
        `${data.imported} clientes importados correctamente.${skippedMessage}`,
      );
      await loadClientes();
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : "No se pudieron importar los clientes.",
      );
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-sterinova-dark">Clientes</h1>
          <p className="mt-1 text-sterinova-teal">
            Listado de clientes del módulo comercial.
          </p>
          <p className="mt-1 text-xs text-sterinova-teal">
            Excel: CLIENTE (razón social), ID (NIT), contacto, teléfono, email y dirección.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleExcelImport}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="inline-flex items-center gap-2 rounded-lg bg-sterinova-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-70"
          >
            <Upload className="h-4 w-4" aria-hidden />
            {importing ? "Importando..." : "Importar desde Excel"}
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-sterinova-orange px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {success ? (
        <p className="text-sm font-medium text-green-700" role="status">
          {success}
        </p>
      ) : null}

      {error ? (
        <p className="text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-sterinova-dark/10">
        <table className="min-w-full divide-y divide-sterinova-dark/10 text-left text-sm">
          <thead className="bg-sterinova-light text-sterinova-dark">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Razón Social</th>
              <th className="px-4 py-3 font-semibold">NIT</th>
              <th className="px-4 py-3 font-semibold">Contacto</th>
              <th className="px-4 py-3 font-semibold">Teléfono</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sterinova-dark/5">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sterinova-teal">
                  Cargando...
                </td>
              </tr>
            ) : clientes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sterinova-teal">
                  No hay clientes registrados.
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.id} className="text-sterinova-dark">
                  <td className="px-4 py-3">{cliente.id}</td>
                  <td className="px-4 py-3 font-medium">{cliente.razon_social}</td>
                  <td className="px-4 py-3">{cliente.nit}</td>
                  <td className="px-4 py-3">{cliente.contacto}</td>
                  <td className="px-4 py-3">{cliente.telefono}</td>
                  <td className="px-4 py-3">{cliente.email}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCliente(cliente);
                        setForm({
                          razon_social: cliente.razon_social,
                          nit: cliente.nit,
                          contacto: cliente.contacto,
                          telefono: cliente.telefono,
                          email: cliente.email,
                          direccion: cliente.direccion,
                        });
                        setError("");
                        setSuccess("");
                        setModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-sterinova-teal hover:bg-sterinova-light"
                      aria-label={`Editar ${cliente.razon_social}`}
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sterinova-dark/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-sterinova-dark">
                {editingCliente ? "Editar Cliente" : "Nuevo Cliente"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setEditingCliente(null);
                  setForm(emptyForm);
                }}
                className="rounded-lg p-1 text-sterinova-dark hover:bg-sterinova-light"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["razon_social", "Razón Social"],
                  ["nit", "NIT"],
                  ["contacto", "Contacto"],
                  ["telefono", "Teléfono"],
                  ["email", "Email"],
                  ["direccion", "Dirección"],
                ] as const
              ).map(([key, label]) => (
              <label
                key={key}
                htmlFor={`cliente-${key}`}
                className="block text-sm sm:col-span-1"
              >
                  <span className="mb-1 block font-medium text-sterinova-dark">
                    {label}
                  </span>
                  <input
                    id={`cliente-${key}`}
                    name={key}
                    required={key !== "email"}
                    type={key === "email" ? "email" : "text"}
                    value={form[key]}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, [key]: event.target.value }))
                    }
                    className="w-full rounded-lg border border-sterinova-dark/20 bg-sterinova-light px-3 py-2 text-sterinova-dark outline-none focus:border-sterinova-teal focus:ring-2 focus:ring-sterinova-teal/30"
                  />
                </label>
              ))}

              <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingCliente(null);
                    setForm(emptyForm);
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-sterinova-dark hover:bg-sterinova-light"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-sterinova-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {saving ? "Guardando..." : editingCliente ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

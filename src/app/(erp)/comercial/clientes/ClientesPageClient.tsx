"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Pencil, Plus, Upload } from "lucide-react";
import * as XLSX from "@e965/xlsx";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/states/EmptyState";
import { ErrorState } from "@/components/ui/states/ErrorState";
import { LoadingState } from "@/components/ui/states/LoadingState";
import { getApiErrorMessage } from "@/lib/api-errors";
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
  const [listError, setListError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitLock = useRef(false);

  function closeModal() {
    setModalOpen(false);
    setEditingCliente(null);
    setForm(emptyForm);
  }

  async function loadClientes() {
    setLoading(true);
    setListError("");
    try {
      const { data } = await api.get<Cliente[]>("/clientes");
      setClientes(data);
      setListError("");
    } catch (loadError) {
      setListError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    api
      .get<Cliente[]>("/clientes")
      .then(({ data }) => {
        if (active) {
          setClientes(data);
          setListError("");
        }
      })
      .catch((loadError: unknown) => {
        if (active) setListError(getApiErrorMessage(loadError));
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
    if (submitLock.current) return;
    submitLock.current = true;
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
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      submitLock.current = false;
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
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
            loading={importing}
            loadingLabel="Importando..."
          >
            <Upload className="h-4 w-4" aria-hidden />
            Importar desde Excel
          </Button>
          <Button
            type="button"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {success ? (
        <p className="text-sm font-medium text-success" role="status">
          {success}
        </p>
      ) : null}

      {error ? (
        <p className="text-sm font-medium text-error" role="alert">
          {error}
        </p>
      ) : null}
      {listError && clientes.length > 0 ? (
        <p className="text-sm font-medium text-error" role="alert">
          {listError}
        </p>
      ) : null}

      {loading ? (
        <LoadingState label="Cargando clientes..." />
      ) : listError && clientes.length === 0 ? (
        <ErrorState message={listError} onRetry={() => void loadClientes()} />
      ) : clientes.length === 0 ? (
        <EmptyState
          title="Aún no hay clientes"
          message="Crea un cliente para comenzar a gestionar cotizaciones."
          action={{
            label: "Crear cliente",
            onClick: () => setModalOpen(true),
          }}
        />
      ) : (
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
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="text-sterinova-dark">
                  <td className="px-4 py-3">{cliente.id}</td>
                  <td className="px-4 py-3 font-medium">{cliente.razon_social}</td>
                  <td className="px-4 py-3">{cliente.nit}</td>
                  <td className="px-4 py-3">{cliente.contacto}</td>
                  <td className="px-4 py-3">{cliente.telefono}</td>
                  <td className="px-4 py-3">{cliente.email}</td>
                  <td className="px-4 py-3">
                    <Button
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
                      variant="ghost"
                      size="sm"
                      className="font-medium"
                      aria-label={`Editar ${cliente.razon_social}`}
                    >
                      <Pencil className="h-4 w-4" aria-hidden />
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editingCliente ? "Editar Cliente" : "Nuevo Cliente"}
        onClose={closeModal}
      >
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
            <div key={key} className="sm:col-span-1">
              <Input
                id={`cliente-${key}`}
                name={key}
                label={label}
                required={key !== "email"}
                type={key === "email" ? "email" : "text"}
                value={form[key]}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, [key]: event.target.value }))
                }
              />
            </div>
          ))}

          <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving} loadingLabel="Guardando...">
              {editingCliente ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

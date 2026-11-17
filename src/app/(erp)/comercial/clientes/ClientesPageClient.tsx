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
import { useSession } from "@/lib/session";
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
  const { permissions } = useSession();
  const canCreate = permissions.includes("clientes.crear");
  const canImport = permissions.includes("clientes.importar");
  const canActivar = permissions.includes("clientes.activar");
  const canInactivar = permissions.includes("clientes.inactivar");
  const canEdit = permissions.includes("clientes.editar");
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

  async function toggleStatus(cliente: Cliente) {
    setError("");
    try {
      await api.patch(`/clientes/${cliente.id}`, { activo: !(cliente.activo ?? true) });
      await loadClientes();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
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
          <h1 className="text-h3 text-surface-foreground">Clientes</h1>
          <p className="mt-1 text-body text-surface-subtle">
            Listado de clientes del módulo comercial.
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
{canImport ? (
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="ghost"
              title="Columnas de Excel: CLIENTE (razón social), ID (NIT), contacto, teléfono, email y dirección."
              loading={importing}
              loadingLabel="Importando..."
            >
              <Upload className="h-4 w-4" aria-hidden />
              Importar desde Excel
            </Button>
          ) : null}
          {canCreate ? (
            <Button type="button" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              Nuevo Cliente
            </Button>
          ) : null}
        </div>
      </div>

      {success ? (
        <p className="rounded-control bg-success-light px-4 py-3 text-sm font-medium text-success-foreground" role="status">
          {success}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-control bg-error-light px-4 py-3 text-sm font-medium text-error-foreground" role="alert">
          {error}
        </p>
      ) : null}
      {listError && clientes.length > 0 ? (
        <p className="rounded-control bg-error-light px-4 py-3 text-sm font-medium text-error-foreground" role="alert">
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
        <div className="overflow-hidden rounded-card border border-surface-border bg-surface shadow-sm">
          <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full divide-y divide-surface-border text-left text-body">
            <thead className="bg-background text-surface-foreground">
              <tr>
                <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">ID</th>
                <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Razón Social</th>
                <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">NIT</th>
                <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Contacto</th>
                <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Teléfono</th>
                <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="text-surface-foreground transition-colors hover:bg-background/60">
                  <td className="px-4 py-3">{cliente.id}</td>
                  <td className="px-4 py-3 font-medium">{cliente.razon_social}</td>
                  <td className="px-4 py-3">{cliente.nit}</td>
                  <td className="px-4 py-3">{cliente.contacto}</td>
                  <td className="px-4 py-3">{cliente.telefono}</td>
                  <td className="px-4 py-3">{cliente.email}</td>
                  <td className="px-4 py-3">
                    {canEdit && (
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
                    )}
                    {(canActivar || canInactivar) && cliente.activo != null && (
                      <Button
                        type="button"
                        onClick={() => void toggleStatus(cliente)}
                        variant="ghost"
                        size="sm"
                        className="font-medium text-xs"
                        aria-label={
                          cliente.activo
                            ? `Inactivar ${cliente.razon_social}`
                            : `Activar ${cliente.razon_social}`
                        }
                      >
                        {cliente.activo ? "Inactivar" : "Activar"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
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

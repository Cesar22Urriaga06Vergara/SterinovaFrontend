"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useStoredUser } from "@/lib/stored-user-hook";
import { SealsTable, type SealRecord } from "./SealsTable";
import { UploadSealDialog } from "./UploadSealDialog";

function errorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(" ");
    if (typeof message === "string") return message;
  }
  return fallback;
}

export default function CertificationSealsPage() {
  const user = useStoredUser();
  const [seals, setSeals] = useState<SealRecord[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [license, setLicense] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSeals = useCallback(async () => {
    setError("");
    try {
      const { data } = await api.get<SealRecord[]>("/sellos");
      setSeals(data);
    } catch (loadError) {
      setError(errorMessage(loadError, "No se pudieron cargar los sellos."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSeals();
  }, [loadSeals]);

  useEffect(() => {
    let active = true;
    const createdUrls: string[] = [];
    Promise.all(seals.map(async (seal) => {
      try {
        const { data } = await api.get<Blob>(`/sellos/${seal.id}/imagen`, { responseType: "blob" });
        const objectUrl = URL.createObjectURL(data);
        createdUrls.push(objectUrl);
        return [seal.id, objectUrl] as const;
      } catch {
        return [seal.id, ""] as const;
      }
    })).then((entries) => {
      if (active) setImageUrls(Object.fromEntries(entries.filter(([, url]) => Boolean(url))));
    });
    return () => {
      active = false;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [seals]);

  function openUpload() {
    setName("");
    setLicense("");
    setFile(null);
    setError("");
    setFormOpen(true);
  }

  async function uploadSeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Selecciona una imagen PNG o JPG.");
      return;
    }
    const formData = new FormData();
    formData.append("nombre_norma", name.trim());
    formData.append("numero_licencia", license.trim());
    formData.append("orden", String(seals.length + 1));
    formData.append("imagen", file);

    setSaving(true);
    setError("");
    try {
      await api.post("/sellos", formData);
      setNotice(`Se agregó el sello ${name.trim()}.`);
      setFormOpen(false);
      await loadSeals();
    } catch (uploadError) {
      setError(errorMessage(uploadError, "No se pudo cargar el sello."));
    } finally {
      setSaving(false);
    }
  }

  async function toggleSeal(seal: SealRecord) {
    setError("");
    setNotice("");
    try {
      await api.patch(`/sellos/${seal.id}`, { activo: !seal.activo });
      setNotice(`${seal.nombre_norma} quedó ${seal.activo ? "inactivo" : "activo"}.`);
      await loadSeals();
    } catch (toggleError) {
      setError(errorMessage(toggleError, "No se pudo cambiar el estado del sello."));
    }
  }

  async function moveSeal(sealId: number, direction: -1 | 1) {
    const ordered = [...seals].sort((a, b) => a.orden - b.orden || a.id - b.id);
    const currentIndex = ordered.findIndex((seal) => seal.id === sealId);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= ordered.length) return;
    [ordered[currentIndex], ordered[targetIndex]] = [ordered[targetIndex], ordered[currentIndex]];
    setSaving(true);
    setError("");
    try {
      await Promise.all(ordered.map((seal, index) => api.patch(`/sellos/${seal.id}`, { orden: index + 1 })));
      setNotice(`Se actualizó el orden de ${ordered[targetIndex].nombre_norma}.`);
      await loadSeals();
    } catch (moveError) {
      setError(errorMessage(moveError, "No se pudo actualizar el orden."));
    } finally {
      setSaving(false);
    }
  }

  if (user?.rol !== "Admin") {
    return <section className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-white p-6 text-sm text-red-700 shadow-sm">Solo un administrador puede gestionar los sellos.</section>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sterinova-teal">Administración</p>
          <h1 className="mt-1 text-3xl font-bold text-sterinova-dark">Sellos de certificación</h1>
          <p className="mt-2 text-sm text-slate-600">Gestiona las imágenes, licencias y orden de los sellos documentales.</p>
        </div>
        <button type="button" onClick={openUpload} className="inline-flex items-center gap-2 rounded-lg bg-sterinova-dark px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sterinova-teal">
          <Plus className="h-4 w-4" aria-hidden /> Subir Sello
        </button>
      </header>

      {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {notice ? <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p> : null}

      <SealsTable
        seals={seals}
        imageUrls={imageUrls}
        loading={loading}
        saving={saving}
        onMove={(id, direction) => void moveSeal(id, direction)}
        onToggle={(seal) => void toggleSeal(seal)}
      />

      {formOpen ? (
        <UploadSealDialog
          name={name}
          license={license}
          file={file}
          saving={saving}
          error={error}
          onNameChange={setName}
          onLicenseChange={setLicense}
          onFileChange={setFile}
          onSubmit={(event) => void uploadSeal(event)}
          onClose={() => setFormOpen(false)}
        />
      ) : null}
    </div>
  );
}

"use client";

import { useId, useRef, useState } from "react";
import { Ban } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { crearSolicitud } from "@/lib/solicitud-anulacion-api";
import { puedeSolicitarAnulacion } from "@/lib/solicitud-anulacion-types";
import { useQuoteHeaders, useSession } from "@/lib/session";

type Props = {
  cotizacion: { id: number; consecutivo: string; estado: string };
  onSuccess: (message: string) => void;
};

export function SolicitudAnulacionButton({ cotizacion, onSuccess }: Props) {
  const { can } = useSession();
  const headers = useQuoteHeaders();
  const fieldId = useId();
  const submitting = useRef(false);
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  if (
    !puedeSolicitarAnulacion(
      cotizacion.estado,
      can("solicitudes_anulacion.crear"),
    )
  )
    return null;

  function close() {
    if (!submitting.current) setOpen(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (!motivo.trim()) {
      setError("Escribe el motivo de la anulación.");
      return;
    }
    submitting.current = true;
    setSaving(true);
    setError("");
    try {
      await crearSolicitud(cotizacion.id, motivo.trim(), headers);
      setOpen(false);
      setSent(true);
      onSuccess(
        `Solicitud de anulación de ${cotizacion.consecutivo} enviada correctamente.`,
      );
    } catch {
      setError(
        "No se pudo enviar la solicitud. Revisa el motivo y vuelve a intentarlo.",
      );
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        disabled={sent}
        onClick={() => {
          setMotivo("");
          setError("");
          setOpen(true);
        }}
      >
        <Ban className="h-4 w-4" aria-hidden="true" />
        {sent ? "Solicitud enviada" : "Solicitar Anulación"}
      </Button>
      <Modal
        open={open}
        title="Solicitar Anulación"
        description={`Cotización ${cotizacion.consecutivo}. El jefe de tu área revisará la solicitud.`}
        onClose={close}
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor={fieldId}
              className="mb-2 block text-sm font-semibold text-surface-foreground"
            >
              Motivo <span className="font-normal">(obligatorio)</span>
            </label>
            <textarea
              id={fieldId}
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              required
              disabled={saving}
              rows={4}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${fieldId}-error` : undefined}
              className="w-full resize-y rounded-control border border-surface-border bg-surface p-3 text-sm text-surface-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
            />
            {error && (
              <p
                id={`${fieldId}-error`}
                role="alert"
                className="mt-2 text-sm text-error"
              >
                {error}
              </p>
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={close}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving} loadingLabel="Enviando...">
              Enviar solicitud
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

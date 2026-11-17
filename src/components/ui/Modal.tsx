"use client";

import { useId } from "react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useDialogA11y } from "./useDialogA11y";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
};

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  size = "md",
  closeOnBackdrop = true,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useDialogA11y({ open, onClose });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-surface-overlay p-4"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`relative my-auto max-h-[calc(100vh-2rem)] w-full ${sizeClasses[size]} overflow-y-auto rounded-dialog bg-surface p-6 shadow-xl outline-none`}
      >
        <div className="mb-5 flex items-start justify-between gap-4 pr-8">
          <div>
            <h2 id={titleId} className="text-xl font-bold text-surface-foreground">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm text-surface-subtle">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar diálogo"
          className="absolute right-4 top-4 rounded-control p-2 text-surface-subtle hover:bg-background hover:text-surface-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  );
}

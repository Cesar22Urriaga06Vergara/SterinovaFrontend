"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import {
  PENDING_TOAST_KEY,
  TOAST_EVENT,
} from "./toast-events";
import type { ToastKind } from "./toast-events";

type ToastMessage = {
  id: number;
  message: string;
  type: ToastKind;
};

const toastStyles: Record<ToastKind, string> = {
  success: "border-emerald-200 text-emerald-950",
  error: "border-red-200 text-red-950",
  info: "border-sterinova-teal/30 text-sterinova-dark",
};

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

let nextToastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef(new Map<number, number>());

  const dismissToast = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const activeTimers = timers.current;

    function addToast(message: string, type: ToastKind) {
      const id = ++nextToastId;
      setToasts((current) => [...current, { id, message, type }]);
      activeTimers.set(
        id,
        window.setTimeout(() => dismissToast(id), 6000),
      );
    }

    function handleToast(event: Event) {
      const detail = (event as CustomEvent<{
        message: string;
        type: ToastKind;
      }>).detail;
      if (detail?.message) {
        addToast(detail.message, detail.type);
      }
    }

    const pendingMessage = window.sessionStorage.getItem(PENDING_TOAST_KEY);
    if (pendingMessage) {
      window.sessionStorage.removeItem(PENDING_TOAST_KEY);
      addToast(pendingMessage, "error");
    }

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, handleToast);
      activeTimers.forEach((timer) => window.clearTimeout(timer));
      activeTimers.clear();
    };
  }, [dismissToast]);

  return (
    <>
      {children}
      <div
        className="fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map(({ id, message, type }) => {
          const Icon = toastIcons[type];
          return (
            <div
              key={id}
              role={type === "error" ? "alert" : "status"}
              className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-lg ${toastStyles[type]}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <p className="min-w-0 flex-1 text-sm font-medium">{message}</p>
              <button
                type="button"
                onClick={() => dismissToast(id)}
                className="rounded p-1 hover:bg-black/5"
                aria-label="Cerrar notificación"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

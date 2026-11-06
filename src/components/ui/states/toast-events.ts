export type ToastKind = "success" | "error" | "info";

export const TOAST_EVENT = "sterinova:toast";
export const PENDING_TOAST_KEY = "sterinova:pending-toast";

export function notifyToast(message: string, type: ToastKind = "info") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(TOAST_EVENT, { detail: { message, type } }),
    );
  }
}

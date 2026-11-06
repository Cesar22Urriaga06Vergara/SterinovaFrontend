import axios from "axios";
import { getApiErrorMessage } from "@/lib/api-errors";
import {
  notifyToast,
  PENDING_TOAST_KEY,
} from "@/components/ui/states/toast-events";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export async function downloadPdfFromBackend(
  endpoint: string,
  filename: string,
): Promise<void> {
  const { data } = await api.get<Blob>(endpoint, { responseType: "blob" });
  const objectUrl = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename.replace(/[\\/:*?"<>|]/g, "_");
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return Promise.reject(
      new axios.CanceledError("La autenticación requiere un navegador"),
    );
  }

  const token = window.localStorage.getItem("access_token");
  if (!token) {
    if (window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
    return Promise.reject(new axios.CanceledError("Sesión no autenticada"));
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      window.localStorage.removeItem("access_token");
      window.localStorage.removeItem("user");
      window.sessionStorage.setItem(
        PENDING_TOAST_KEY,
        "Tu sesión ha expirado, por favor ingresa de nuevo.",
      );
      window.location.replace("/login");
    } else if (axios.isAxiosError(error)) {
      notifyToast(getApiErrorMessage(error), "error");
    }

    return Promise.reject(error);
  },
);

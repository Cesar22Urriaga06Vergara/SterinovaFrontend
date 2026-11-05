"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parseStoredUser } from "./stored-user";

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === "user" || event.key === null) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

function getSnapshot() {
  return localStorage.getItem("user");
}

function getServerSnapshot() {
  return null;
}

export function useStoredUser() {
  const storedValue = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return useMemo(() => parseStoredUser(storedValue), [storedValue]);
}

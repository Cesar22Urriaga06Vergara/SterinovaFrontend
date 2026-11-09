"use client";
import { useSession } from "./session";
/** Compatibility name: identity is validated by /auth/me. */
export function useStoredUser() { return useSession().user; }

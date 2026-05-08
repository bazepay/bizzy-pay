import { useSyncExternalStore } from "react";

const KEY = "bazepay.admin.session";

export type AdminSession = {
  email: string;
  name: string;
  role: "super_admin" | "compliance" | "finance" | "card_ops" | "telco_ops" | "support" | "growth" | "auditor";
  loggedInAt: string;
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function read(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

export function getSession() {
  return read();
}

export function login(email: string) {
  const session: AdminSession = {
    email,
    name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    role: "super_admin",
    loggedInAt: new Date().toISOString(),
  };
  window.localStorage.setItem(KEY, JSON.stringify(session));
  emit();
  return session;
}

export function logout() {
  window.localStorage.removeItem(KEY);
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useSession(): AdminSession | null {
  const snap = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(KEY) ?? "",
    () => "",
  );
  return snap ? (JSON.parse(snap) as AdminSession) : null;
}

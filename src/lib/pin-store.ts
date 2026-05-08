import { useSyncExternalStore } from "react";

const KEY = "bazepay.pin";

const listeners = new Set<() => void>();
const emit = () => {
  for (const l of listeners) l();
};

function read(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function hasPin(): boolean {
  return !!read();
}

export function setPin(pin: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, pin);
  emit();
}

export function clearPin() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  emit();
}

export function verifyPin(pin: string): boolean {
  return read() === pin;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useHasPin(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => (read() ? "1" : "0"),
    () => "0",
  ) === "1";
}

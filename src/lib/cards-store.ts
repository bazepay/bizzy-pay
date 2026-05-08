import { useSyncExternalStore } from "react";
import {
  cards as initialCards,
  cardTxns as initialTxns,
  type VirtualCard,
  type CardTxn,
  type CardBrand,
} from "./cards";

type State = {
  cards: VirtualCard[];
  txns: CardTxn[];
};

let state: State = {
  cards: [...initialCards],
  txns: [...initialTxns],
};

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useCardsStore() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

export function getCard(id: string) {
  return state.cards.find((c) => c.id === id);
}

export function updateCard(id: string, patch: Partial<VirtualCard>) {
  state = {
    ...state,
    cards: state.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  };
  emit();
}

export function toggleFreeze(id: string) {
  const c = getCard(id);
  if (!c) return;
  updateCard(id, { status: c.status === "frozen" ? "active" : "frozen" });
}

export function topUpCard(id: string, amount: number) {
  const c = getCard(id);
  if (!c) return;
  updateCard(id, { balanceNgn: c.balanceNgn + amount });
  const txn: CardTxn = {
    id: `ct-${Date.now()}`,
    cardId: id,
    merchant: "Wallet top-up",
    category: "topup",
    amountNgn: amount,
    at: new Date().toISOString(),
    status: "settled",
  };
  state = { ...state, txns: [txn, ...state.txns] };
  emit();
}

export function cancelCard(id: string) {
  state = { ...state, cards: state.cards.filter((c) => c.id !== id) };
  emit();
}

export function setLimit(id: string, limit: number) {
  updateCard(id, { monthlyLimitNgn: limit });
}

export function setBlocked(id: string, blocked: string[]) {
  updateCard(id, { blockedCategories: blocked });
}

function randomDigits(n: number) {
  let s = "";
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function makePan(brand: CardBrand) {
  const prefix = brand === "Visa" ? "4" : "5";
  const rest = randomDigits(15);
  const digits = (prefix + rest).slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function issueCard(input: {
  label: string;
  brand: CardBrand;
  gradient: { from: string; to: string };
}): VirtualCard {
  const yr = new Date().getFullYear() + 4;
  const card: VirtualCard = {
    id: `vc-${Date.now()}`,
    label: input.label,
    holder: "TUNDE OKE",
    brand: input.brand,
    pan: makePan(input.brand),
    cvv: randomDigits(3),
    expiry: `${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}/${String(yr).slice(-2)}`,
    balanceNgn: 0,
    monthlyLimitNgn: 500_000,
    monthlySpentNgn: 0,
    status: "active",
    blockedCategories: [],
    gradient: input.gradient,
    createdAt: new Date().toISOString(),
  };
  state = { ...state, cards: [card, ...state.cards] };
  emit();
  return card;
}

"use client";

import { useSyncExternalStore } from "react";

/**
 * Client cart. Prices here are for display only; the server re-prices every
 * line from the database at checkout. Persisted in localStorage (guest-first).
 */
export type CartLine = {
  key: string;
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  weightGrams: number;
  unitPaise: number;
  quantity: number;
  cakeMessage: string;
  giftNote: string;
  image: { src: string; width: number; height: number } | null;
};

export type ServiceArea = { pincode: string; area: string };

type State = { lines: CartLine[]; area: ServiceArea | null; lastAdded: { name: string; at: number } | null; pendingAdd: Omit<CartLine, "key" | "quantity"> | null };

const KEY = "cart:v1";
const MAX_QTY = 20;
const EMPTY: State = { lines: [], area: null, lastAdded: null, pendingAdd: null };

let state: State = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>;
      state = { lines: Array.isArray(parsed.lines) ? parsed.lines : [], area: parsed.area ?? null, lastAdded: null, pendingAdd: null };
    }
  } catch {
    state = EMPTY;
  }
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    loaded = false;
    load();
    emit();
  });
}

function emit() {
  listeners.forEach((l) => l());
}

function save(next: State) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ lines: next.lines, area: next.area }));
  } catch {
    /* private mode / quota: cart still works for this tab */
  }
  emit();
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  return () => listeners.delete(l);
}

const getSnapshot = () => {
  load();
  return state;
};
const getServerSnapshot = () => EMPTY;

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const lineKey = (l: Pick<CartLine, "variantId" | "cakeMessage" | "giftNote">) => `${l.variantId}|${l.cakeMessage}|${l.giftNote}`;

export const cart = {
  add(line: Omit<CartLine, "key" | "quantity">, quantity = 1) {
    const key = lineKey(line);
    const existing = state.lines.find((l) => l.key === key);
    const lines = existing
      ? state.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l))
      : [...state.lines, { ...line, key, quantity: Math.min(MAX_QTY, quantity) }];
    save({ ...state, lines, lastAdded: { name: line.name, at: Date.now() } });
  },
  setQuantity(key: string, quantity: number) {
    const q = Math.max(1, Math.min(MAX_QTY, Math.round(quantity)));
    save({ ...state, lines: state.lines.map((l) => (l.key === key ? { ...l, quantity: q } : l)) });
  },
  remove(key: string) {
    save({ ...state, lines: state.lines.filter((l) => l.key !== key) });
  },
  /** Refresh display prices/availability from the server; drops lines that are no longer purchasable. */
  reconcile(valid: Record<string, number>) {
    save({ ...state, lines: state.lines.filter((l) => l.variantId in valid).map((l) => ({ ...l, unitPaise: valid[l.variantId] })) });
  },
  clear() {
    save({ ...state, lines: [] });
  },
  /** Add now if a pincode is known; otherwise park the line for the shared pincode dialog. */
  request(line: Omit<CartLine, "key" | "quantity">) {
    if (state.area) cart.add(line);
    else {
      state = { ...state, pendingAdd: line };
      emit();
    }
  },
  cancelPending() {
    state = { ...state, pendingAdd: null };
    emit();
  },
  setArea(area: ServiceArea | null) {
    const pending = state.pendingAdd;
    save({ ...state, area, pendingAdd: null });
    if (area && pending) cart.add(pending);
  },
  dismissToast() {
    state = { ...state, lastAdded: null };
    emit();
  },
  MAX_QTY,
};

export const cartCount = (s: State) => s.lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (s: State) => s.lines.reduce((n, l) => n + l.unitPaise * l.quantity, 0);

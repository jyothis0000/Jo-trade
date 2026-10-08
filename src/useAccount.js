import { useCallback, useEffect, useState } from "react";

const KEY = "dash-token";
export const getToken = () => localStorage.getItem(KEY);
export const lock = () => {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("locked"));
};
export const login = async (pin) => {
  const { token } = await call("/api/login", "POST", { pin });
  localStorage.setItem(KEY, token);
};

async function call(url, method = "GET", body) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: body && JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && url !== "/api/login") lock();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  saveSettings: (s) => call("/api/settings", "PUT", s),
  saveEntry: (e) => call("/api/entries", "POST", e),
  deleteEntry: (date) => call(`/api/entries/${date}`, "DELETE"),
};

// Loads settings + entries and derives the analytics numbers the dashboard shows.
export function useAccount() {
  const [state, setState] = useState({ loading: true, error: null, settings: null, entries: [] });

  const reload = useCallback(
    () =>
      call("/api/account")
        .then((d) => setState({ loading: false, error: null, ...d }))
        .catch((e) => setState((s) => ({ ...s, loading: false, error: e.message }))),
    []
  );
  useEffect(() => { reload(); }, [reload]);

  const { settings, entries } = state;
  const last = entries[entries.length - 1];
  const equity = last ? last.equity : settings?.initialBalance ?? 0;
  const derived = settings && {
    equity,
    pnl: equity - settings.initialBalance,
    tradedDays: entries.length,
    dailyLossUsed: last ? last.dailyLoss : 0,
    maxLossRemaining: equity - (settings.initialBalance - settings.maxLossLimit),
    curve: entries.map((e) => ({ x: e.date, y: e.equity })),
  };

  return { ...state, derived, reload };
}

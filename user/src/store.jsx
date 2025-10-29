import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

const Ctx = createContext(null);

function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }) {
  // INIT from localStorage
  const [details, setDetails] = useState(() => safeParse("details", null));
  const [cart, setCart] = useState(() => safeParse("cart", {}));

  // SYNC to localStorage
  useEffect(() => {
    try { localStorage.setItem("details", JSON.stringify(details)); } catch {}
  }, [details]);

  useEffect(() => {
    try { localStorage.setItem("cart", JSON.stringify(cart)); } catch {}
  }, [cart]);

  const value = useMemo(() => ({ details, setDetails, cart, setCart }), [details, cart]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  return useContext(Ctx);
}

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
const Ctx = createContext(null);

export function StoreProvider({ children }){
  const [details, setDetails] = useState(() => {
    try { return JSON.parse(localStorage.getItem('details')) } catch { return null }
  });
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || {} } catch { return {} }
  });

  useEffect(()=> localStorage.setItem('details', JSON.stringify(details)), [details]);
  useEffect(()=> localStorage.setItem('cart', JSON.stringify(cart)), [cart]);

  const value = useMemo(()=>({ details, setDetails, cart, setCart }), [details, cart]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export function useStore(){ return useContext(Ctx); }

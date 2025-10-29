import React, { createContext, useContext, useMemo, useState } from "react";
const Ctx = createContext(null);
export function StoreProvider({ children }){
  const [details, setDetails] = useState(null);   // {type,name,phone,address,members?}
  const [cart, setCart] = useState({});           // { [itemId]: qty }
  const value = useMemo(()=>({ details, setDetails, cart, setCart }), [details, cart]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export function useStore(){ return useContext(Ctx); }

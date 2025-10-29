import React from "react";
import { NavLink } from "react-router-dom";
const Icon = ({ name }) => {
  const cls = "w-5 h-5";
  switch (name) {
    case "analytics": return (<svg className={cls} viewBox="0 0 24 24" fill="none"><path d="M4 19h16M7 16V8m5 8V5m5 11v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
    case "tables": return (<svg className={cls} viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="2"/><path d="M7 10v8M17 10v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
    case "menu": return (<svg className={cls} viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
    case "orders": return (<svg className={cls} viewBox="0 0 24 24" fill="none"><path d="M6 7h12l-1 10H7L6 7z" stroke="currentColor" strokeWidth="2"/><path d="M9 7a3 3 0 1 1 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>);
    default: return null;
  }
};
export default function NavBar(){
  const link = "flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm";
  const cls = ({isActive}) => isActive ? "bg-black text-white "+link : "hover:bg-gray-100 text-gray-700 "+link;
  return (<aside className="w-20 min-h-screen bg-white border-r"><div className="p-4 flex items-center justify-center"><img src="/logo.svg" alt="Company" className="w-8 h-8"/></div><nav className="p-2 flex flex-col gap-2 items-center">
    <NavLink to="/analytics" className={cls} title="Analytics"><Icon name="analytics" /></NavLink>
    <NavLink to="/tables" className={cls} title="Tables"><Icon name="tables" /></NavLink>
    <NavLink to="/menu" className={cls} title="Menu"><Icon name="menu" /></NavLink>
    <NavLink to="/orders" className={cls} title="Order Line"><Icon name="orders" /></NavLink>
  </nav></aside>);
}

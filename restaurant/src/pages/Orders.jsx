import React, { useEffect, useState } from "react";
import { api } from "../api";
import NavBar from "../components/NavBar";
export default function Orders(){
  const [orders, setOrders] = useState([]);
  const containerCls = "max-w-[1100px] mx-auto p-4 space-y-4";
  async function load(){ const r = await api.get('/api/orders?range=daily'); setOrders(r.data); }
  useEffect(()=>{ load(); const t = setInterval(load, 10000); return ()=>clearInterval(t); }, []);
  const statusBadge = (status) => {
    const map = { PROCESSING:'bg-orange-500', DONE:'bg-green-500', SERVED:'bg-green-600', PICKED_UP:'bg-green-600', NOT_PICKED:'bg-red-500' };
    const cls = map[status] || 'bg-gray-400';
    const text = status==='PROCESSING' ? 'Processing' : status==='DONE' ? 'Done' : status==='SERVED' ? 'Served' : status==='PICKED_UP' ? 'Picked Up' : status==='NOT_PICKED' ? 'Not Picked' : status;
    return <span className={`text-white text-xs px-2 py-0.5 rounded-full ${cls}`}>{text}</span>;
  };
  return (<div className="flex min-h-screen"><NavBar /><main className="flex-1"><div className={containerCls}>
    <div className="font-semibold tracking-wide">Order Line</div>
    <div className="grid md:grid-cols-3 gap-3">
      {orders.map(o => {
        const isDoneLabel = (o.status==='DONE' || o.status==='SERVED' || o.status==='PICKED_UP' || o.remainingMinutes===0);
        const timeLabel = isDoneLabel ? (o.type==='DINE_IN' ? 'Served' : 'Item Delivered') : `Ongoing: ${Math.max(0, o.remainingMinutes||0)} Min`;
        return (<div key={o._id} className="bg-white rounded-2xl shadow-card p-3 border flex flex-col">
          <div className="flex items-start justify-between">
            <div className="text-sm font-semibold">#{o.orderId}</div>
            <div className="text-right text-xs"><div className="font-medium">{o.type==='DINE_IN' ? 'Dine In' : 'Take Away'}</div><div className="opacity-80">{timeLabel}</div></div>
          </div>
          <div className="mt-1 text-xs opacity-70">{new Date(o.createdAt).toLocaleString()}</div>
          {o.type==='DINE_IN' && <div className="text-xs">Table-{String(o.tableNumber).padStart(2,'0')}</div>}
          <div className="text-xs">{(o.items||[]).reduce((a,b)=>a+(b.qty||1),0)} Item</div>
          <div className="mt-2"><div className="text-xs font-medium mb-1">Items</div><ul className="text-xs list-disc pl-5">{(o.items||[]).map((it,i)=>(<li key={i}>{it.item?.name} x {it.qty}</li>))}</ul></div>
          {o.cookingInstructions && (<div className="mt-2"><div className="text-xs font-medium mb-1">Cooking Instructions</div><div className="text-xs">{o.cookingInstructions}</div></div>)}
          <div className="mt-3 pt-2 border-t flex justify-end">{statusBadge(o.status==='PROCESSING' && o.remainingMinutes===0 ? 'DONE' : o.status)}</div>
        </div>)
      })}
    </div>
  </div></main></div>)
}

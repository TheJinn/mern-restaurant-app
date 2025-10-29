import React, { useEffect, useState } from "react";
import { api } from "../api";
import NavBar from "../components/NavBar";
export default function Tables(){
  const [tables, setTables] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [size, setSize] = useState(2);
  const load = ()=> api.get('/api/tables').then(r=>setTables(r.data));
  useEffect(()=>{ load() }, []);
  async function createTable(){ await api.post('/api/tables', { size }); setShowAdd(false); setSize(2); load(); }
  async function deleteTable(number){ await api.delete(`/api/tables/${number}`); load(); }
  return (<div className="flex min-h-screen"><NavBar /><main className="flex-1"><div className="max-w-[1100px] mx-auto p-4 space-y-4">
    <div className="text-lg font-semibold">Tables</div>
    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
      {tables.map(t => (<div key={t.number} className={`rounded-2xl border p-2 text-center relative ${t.reserved?'bg-green-500 text-white':'bg-white'}`}>
        <button onClick={()=>deleteTable(t.number)} className="absolute -top-2 -right-2 bg-white border rounded-full w-6 h-6 flex items-center justify-center text-xs">×</button>
        <div className="text-[10px] uppercase tracking-wide">Table</div>
        <div className="text-2xl font-bold">{String(t.number).padStart(2,'0')}</div>
        <div className="text-xs">{String(t.size).padStart(2,'0')} Chairs</div>
      </div>))}
      {tables.length < 30 && (<button onClick={()=>setShowAdd(true)} className="rounded-2xl border-dashed border-2 p-2 text-center text-gray-500 hover:bg-gray-50">+ Add</button>)}
    </div>
    {showAdd && (<div className="fixed inset-0 bg-black/30 flex items-center justify-center"><div className="bg-white rounded-2xl p-4 w-80">
      <div className="font-semibold mb-2">Create table</div><div className="text-sm mb-2">Number of chairs</div>
      <div className="grid grid-cols-4 gap-2 mb-3">{[2,4,6,8].map(n => (<button key={n} onClick={()=>setSize(n)} className={`border rounded-lg py-2 ${size===n?'bg-black text-white':''}`}>{n}</button>))}</div>
      <div className="flex justify-end gap-2"><button className="border rounded-full px-3 py-1" onClick={()=>setShowAdd(false)}>Cancel</button><button className="bg-black text-white rounded-full px-3 py-1" onClick={createTable}>Create</button></div>
    </div></div>)}
    <div className="flex items-center gap-4 mt-4"><span className="inline-block w-3 h-3 bg-green-500 rounded-full"/> Reserved <span className="inline-block w-3 h-3 bg-white border rounded-full"/> Available</div>
  </div></main></div>)
}

import React, { useEffect, useState } from "react";
import { api } from "../api";
import NavBar from "../components/NavBar";
const CATS = ['Burger','Pizza','Salad','Dessert','Drink'];

async function uploadImageToCloudinary(file) {
  //short-lived signature from API
  const { data: sig } = await api.get("/api/uploads/sign");

  //upload to Cloudinary
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", sig.timestamp);
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);

  const cloudUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;
  const res = await fetch(cloudUrl, { method: "POST", body: form });
  const json = await res.json();
  if (!json.secure_url) throw new Error("Image upload failed");
  return json.secure_url.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
}

export default function Menu(){
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState('');
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name:'', description:'', price:'', averagePreparationTime:'', category:CATS[0], stock:true, productImage:'', rating:'' });
  const load = ()=> api.get(`/api/menu?q=${encodeURIComponent(q)}`).then(r=>setItems(r.data.items || []));
  useEffect(()=>{ load() }, [q]);
  async function createItem(){
    if (uploading) return;
    const payload = { ...form, price: Number(form.price||0), averagePreparationTime: Number(form.averagePreparationTime||0), rating: Math.max(0, Math.min(5, Number(form.rating||0))) };
    await api.post('/api/menu', payload);
    setToast('item added'); setTimeout(()=>setToast(''), 1600);
    setForm({ name:'', description:'', price:'', averagePreparationTime:'', category:CATS[0], stock:true, productImage:'', rating:'' });
    load();
  }
  return (<div className="flex min-h-screen"><NavBar /><main className="flex-1"><div className="max-w-[1100px] mx-auto p-4 space-y-4">
    <div className="flex justify-between items-center"><div className="text-lg font-semibold">Menu</div><input className="border rounded px-3 py-2 w-64" placeholder="Search items" value={q} onChange={e=>setQ(e.target.value)} /></div>
    <div className="grid md:grid-cols-9 gap-3 items-end">
      <div><div className="text-sm">Name:</div><input className="border rounded px-2 py-1 w-full" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
      <div><div className="text-sm">Description:</div><input className="border rounded px-2 py-1 w-full" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
      <div><div className="text-sm">Price:</div><input type="number" className="border rounded px-2 py-1 w-full" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))}/></div>
      <div><div className="text-sm">Avg Prep (min):</div><input type="number" className="border rounded px-2 py-1 w-full" value={form.averagePreparationTime} onChange={e=>setForm(f=>({...f,averagePreparationTime:e.target.value}))}/></div>
      <div><div className="text-sm">Category:</div><select className="border rounded px-2 py-1 w-full" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{CATS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
      <div><div className="text-sm">Rating (0–5):</div><input type="number" min="0" max="5" step="0.1" className="border rounded px-2 py-1 w-full" value={form.rating} onChange={e=>setForm(f=>({...f,rating:e.target.value}))}/></div>
      <div><div className="text-sm">
        <span>Upload Image:</span>
        {uploading && (<span className="text-xs text-gray-500">uploading…</span>)}</div>
        <input type="file" accept="image/*" className="block text-sm" onChange={ async (e)=>{ 
          const file = e.target.files?.[0]; 
          if (!file) return; 
          try { 
            setUploading(true); 
            const url = await uploadImageToCloudinary(file); 
            setForm((f) => ({ ...f, productImage: url })); 
          } catch (err) { 
            console.error(err); 
            alert("Image upload failed");
          } finally { 
            setUploading(false);
          } 
        }}/>
      </div>
      <div><div className="text-sm">In Stock:</div><select className="border rounded px-2 py-1 w-full" value={String(form.stock)} onChange={e=>setForm(f=>({...f, stock: e.target.value==='true'}))}><option value="true">Yes</option><option value="false">No</option></select></div>
      <button className="bg-black text-white px-3 py-2 rounded-full col-span-full md:col-span-1" onClick={createItem} disabled={uploading}>{uploading ? "Uploading…" : "Create"}</button>
    </div>
    {toast && <div className="fixed right-4 top-4 bg-black text-white rounded-full px-3 py-1 text-sm">{toast}</div>}
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map(it => (<div key={it._id} className="bg-white rounded-2xl shadow-card p-3 border">
        {it.productImage && (<img src={it.productImage} alt={it.name} className="w-full h-28 object-cover rounded-lg mb-2" />)}
        <div className="font-medium flex items-center justify-between"><span>{it.name}</span><span className="text-xs">★ {Number(it.rating||0).toFixed(1)}</span></div>
        <div className="text-xs opacity-70">{it.description}</div><div className="text-sm">₹ {it.price}</div>
        <div className="text-xs">Avg Prep: {it.averagePreparationTime} min</div><div className="text-xs">Category: {it.category}</div>
        <div className={`text-xs mt-1 font-medium ${it.stock? 'text-green-600' : 'text-red-600'}`}>{it.stock ? 'In Stock' : 'Out of Stock'}</div>
      </div>))}
    </div>
  </div></main></div>)
}

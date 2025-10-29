import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useStore } from "../store.jsx";

export default function Home(){
  const nav = useNavigate();
  const { details, setDetails, cart, setCart } = useStore();

  // Modal
  const [showForm, setShowForm] = useState(!details);
  const [type, setType] = useState(details?.type || 'DINE_IN');
  const [name, setName] = useState(details?.name || '');
  const [members, setMembers] = useState(details?.members || '');
  const [address, setAddress] = useState(details?.address || '');
  const [phone, setPhone] = useState(details?.phone || '');

  // Catalog
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState('All');
  const [q, setQ] = useState('');
  const [qDebounced, setQDebounced] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const sentinel = useRef(null);
  const filterSeqRef = useRef(0); // guard against stale API responses

  // Debounce search
  useEffect(()=>{
    const t = setTimeout(()=>setQDebounced(q.trim()), 250);
    return ()=>clearTimeout(t);
  }, [q]);

  // Lock body scroll when modal is open
  useEffect(()=>{
    const prev = document.body.style.overflow;
    document.body.style.overflow = showForm ? 'hidden' : prev || '';
    return ()=>{ document.body.style.overflow = prev; };
  }, [showForm]);

  // Fetch categories
  useEffect(()=>{
    api.get('/api/menu/categories').then(r=>{
      const list = Array.isArray(r.data) ? r.data : [];
      setCategories(['All', ...list]);
    }).catch(()=> setCategories(['All']));
  }, []);

  // Reset & mark filter sequence when filters change
  useEffect(()=>{
    setItems([]); setPage(1); setHasMore(true);
    filterSeqRef.current += 1;
  }, [activeCat, qDebounced]);

  // Load items with server-side filtering
  useEffect(()=>{
    if (!hasMore) return;
    const seqAtCall = filterSeqRef.current;
    (async ()=>{
      const params = new URLSearchParams();
      params.set('page', page); params.set('limit', 24);
      if (activeCat && activeCat !== 'All') params.set('category', activeCat);
      if (qDebounced) params.set('q', qDebounced);
      const { data } = await api.get(`/api/menu?${params.toString()}`);
      if (seqAtCall !== filterSeqRef.current) return; // ignore stale
      const newItems = data?.items ?? [];
      setItems(prev => [...prev, ...newItems]);
      setHasMore(Boolean(data?.hasMore));
    })().catch(()=>{});
  }, [page, activeCat, qDebounced, hasMore]);

  // Infinite scroll
  useEffect(()=>{
    const io = new IntersectionObserver((entries)=>{
      if (entries[0].isIntersecting && hasMore) setPage(p=>p+1);
    }, { rootMargin: '200px' });
    if (sentinel.current) io.observe(sentinel.current);
    return ()=>io.disconnect();
  }, [hasMore]);

  const cartCount = Object.values(cart).reduce((a,b)=>a+b,0);
  const canProceed = cartCount > 0;

  function handleOrderNow(){
    if (!name.trim() || !phone.trim()) return;
    if (type === 'DINE_IN' && (!members || Number(members) <= 0)) return;
    setDetails({ type, name: name.trim(), phone: phone.trim(), address: address.trim(), members: type==='DINE_IN' ? Number(members) : undefined });
    setShowForm(false);
  }

  return (
    <div className="min-h-screen flex items-stretch justify-center bg-gray-100">
      <div className={`relative w-[414px] min-h-screen bg-white shadow ${showForm ? 'pointer-events-none overflow-hidden' : ''}`}>
        {/* Fixed Header */}
        <div className="sticky top-0 z-20 bg-white">
          <div className="px-4 pt-4">
            <div className="text-xl font-semibold">Good evening</div>
            <div className="text-xs opacity-70 mb-3">Place you order here</div>
            <input placeholder="Search" className="w-full border rounded px-3 py-2" value={q} onChange={e=>setQ(e.target.value)} />
          </div>
          <div className="px-2 py-2 overflow-x-auto flex gap-2">
            {categories.map(cat => (
              <button key={cat} onClick={()=>setActiveCat(cat)}
                className={`px-3 py-1 rounded-full border whitespace-nowrap ${activeCat===cat?'bg-black text-white':''}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Items */}
        <div className="px-3 pb-24 space-y-2">
          <div className="grid grid-cols-2 gap-3">
            {items.map(it => (
              <div key={it._id} className="border rounded-2xl p-3 relative overflow-hidden">
                {it.productImage && <img src={it.productImage} alt={it.name} className="w-full h-28 object-cover rounded-lg mb-2" />}
                <div className="font-medium flex items-center justify-between">
                  <span>{it.name}</span>
                  <span className="text-xs">★ {Number(it.rating||0).toFixed(1)}</span>
                </div>
                <div className="text-sm">₹ {it.price}</div>
                <div className={`text-[11px] mt-1 font-medium ${it.stock? 'text-green-600' : 'text-red-600'}`}>{it.stock ? 'In Stock' : 'Out of Stock'}</div>
                {!it.stock && <div className="absolute inset-0 bg-white/60 flex items-center justify-center text-sm font-semibold">OUT OF STOCK</div>}
                <div className="flex items-center gap-2 mt-2">
                  <button className="border rounded px-2" onClick={()=>setCart(c=>{ const q=Math.max(0,(c[it._id]||0)-1); const cp={...c}; if(q===0) delete cp[it._id]; else cp[it._id]=q; return cp; })}>-</button>
                  <div className="min-w-[1.5rem] text-center text-sm">{cart[it._id]||0}</div>
                  <button className={`border rounded px-2 ${it.stock===false?'opacity-40 cursor-not-allowed':''}`} disabled={it.stock===false}
                    onClick={()=>setCart(c=>({ ...c, [it._id]: (c[it._id]||0)+1 }))}>+</button>
                </div>
              </div>
            ))}
          </div>
          <div ref={sentinel} className="h-10" />
        </div>

        {/* Next Button */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[414px] bg-white border-t p-3">
          <button disabled={!canProceed} onClick={()=>nav('/checkout')}
            className={`w-full rounded-full py-3 font-semibold ${canProceed ? 'bg-black text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
            Next
          </button>
        </div>

        {/* Modal overlay */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center pointer-events-auto">
            <div className="bg-white rounded-2xl w-[360px] p-4">
              <div className="text-lg font-semibold mb-2">Enter Your Details</div>
              <div className="flex gap-2 mb-3">
                <button onClick={()=>setType('DINE_IN')} className={`flex-1 border rounded-full py-2 ${type==='DINE_IN'?'bg-black text-white':''}`}>Dine In</button>
                <button onClick={()=>setType('TAKEAWAY')} className={`flex-1 border rounded-full py-2 ${type==='TAKEAWAY'?'bg-black text-white':''}`}>Take Away</button>
              </div>
              <div className="space-y-2">
                <input placeholder="Name" className="w-full border rounded px-3 py-2" value={name} onChange={e=>setName(e.target.value)} />
                {type==='DINE_IN' && <input placeholder="Number of Person" className="w-full border rounded px-3 py-2" value={members} onChange={e=>setMembers(e.target.value)} />}
                <input placeholder="Address" className="w-full border rounded px-3 py-2" value={address} onChange={e=>setAddress(e.target.value)} />
                <input placeholder="Contact" className="w-full border rounded px-3 py-2" value={phone} onChange={e=>setPhone(e.target.value)} />
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={handleOrderNow} className="rounded-full bg-black text-white px-4 py-2">Order Now</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

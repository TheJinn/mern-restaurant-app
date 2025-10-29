import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useStore } from "../store.jsx";

export default function Checkout(){
  const nav = useNavigate();
  const { details, cart, setCart } = useStore();
  const [items, setItems] = useState([]);
  const [showInst, setShowInst] = useState(false);
  const [inst, setInst] = useState('');
  const [swipe, setSwipe] = useState(0);
  const [loading, setLoading] = useState(true);

  const cartCount = Object.values(cart || {}).reduce((a, b) => a + b, 0);

  useEffect(()=>{
    if (!cartCount) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    if (!details) { nav('/'); return; }
    api.get('/api/menu').then(r=>{
      const all = r.data?.items || [];
      const picked = all.filter(it => (cart[it._id]||0) > 0).map(it => ({ ...it, qty: cart[it._id] }));
      setItems(picked);
    }).finally(() => setLoading(false));
  }, [cartCount, details, cart, nav]);

  if (loading && cartCount > 0) {
    return (
      <div className="min-h-screen flex items-stretch justify-center bg-gray-100">
        <div className="w-[414px] min-h-screen bg-white shadow p-6 flex items-center justify-center">
          <div className="text-sm text-gray-600">Loading your cart…</div>
        </div>
      </div>
    );
  }

  const subtotal = useMemo(()=>items.reduce((a,b)=>a + b.price*b.qty, 0), [items]);
  const tax = useMemo(()=>+(subtotal*0.04).toFixed(2), [subtotal]);
  const delivery = useMemo(()=> details?.type==='TAKEAWAY' ? 50 : 0, [details]);
  const total = subtotal + tax + delivery;

  function dec(id){ setCart(c => { const q = Math.max(0,(c[id]||0)-1); const cp = { ...c }; if (q===0) delete cp[id]; else cp[id]=q; return cp; }); }
  function inc(id){ setCart(c => ({ ...c, [id]: (c[id]||0)+1 })); }
  function remove(id){ setCart(c => { const cp = { ...c }; delete cp[id]; return cp; }); }

  async function placeOrder(){
    if (!items.length || !details) return;
    const body = {
      type: details.type,
      tableNumber: null,
      customerName: details.name,
      phone: details.phone,
      address: details.address,
      members: details.type==='DINE_IN' ? details.members : 0,
      items: items.map(it => ({ item: it._id, qty: it.qty })),
      cookingInstructions: inst
    };
    await api.post('/api/orders', body);
    setCart({});
    setSwipe(0);
    nav('/thanks');
  }
  useEffect(()=>{ if (swipe >= 95) { placeOrder(); } }, [swipe]); // swipe-to-order

  if (!loading && cartCount === 0) {
    // Empty cart view
    return (
      <div className="min-h-screen flex items-stretch justify-center bg-gray-100">
        <div className="w-[414px] min-h-screen bg-white shadow p-6 flex flex-col items-center justify-center text-center">
          <div className="text-lg font-semibold mb-2">Cart is empty</div>
          <div className="text-sm text-gray-600 mb-4">Please add some items from the menu.</div>
          <button className="rounded-full bg-black text-white px-4 py-2" onClick={()=>nav('/')}>Go to Menu</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-stretch justify-center bg-gray-100">
      <div className="relative w-[414px] min-h-screen bg-white shadow p-3">
        <div className="text-xs mb-2">Your details</div>
        <div className="text-sm font-medium mb-3">{details?.name || '—'}, {details?.phone || '—'}</div>
        {details?.type==='TAKEAWAY' ? (
          <>
            <div className="text-sm">Delivery in 40-50 mins</div>
            <div className="text-sm mb-2">Delivery at Home - {details?.address || '—'}</div>
          </>
        ) : (<div className="text-sm mb-2">Members: {details?.members || '—'}</div>)}

        <div className="space-y-2">
          {items.map(it => (
            <div key={it._id} className="flex gap-3 items-center border rounded-2xl p-2 relative">
              <button className="absolute right-2 top-2 text-lg leading-none" onClick={()=>remove(it._id)}>×</button>
              {it.productImage && <img src={it.productImage} alt={it.name} className="w-16 h-16 object-cover rounded" />}
              <div className="flex-1">
                <div className="font-medium">{it.name}</div>
                <div className="text-sm">₹ {it.price}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="border rounded px-2" onClick={()=>dec(it._id)}>-</button>
                <div className="min-w-[1.5rem] text-center text-sm">{it.qty}</div>
                <button className="border rounded px-2" onClick={()=>inc(it._id)}>+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Single cooking-instructions trigger */}
        <div className="mt-2">
          <button className="text-sm underline" onClick={()=>setShowInst(true)}>Add cooking instructions (optional)</button>
        </div>

        {/* Bill */}
        <div className="border rounded-2xl p-3 mt-3">
          <div className="flex justify-between text-sm"><div>Item Total</div><div>₹ {subtotal.toFixed(2)}</div></div>
          {details?.type==='TAKEAWAY' && <div className="flex justify-between text-sm"><div>Delivery Charge</div><div>₹ 50</div></div>}
          <div className="flex justify-between text-sm"><div>Taxes</div><div>₹ {tax.toFixed(2)}</div></div>
          <div className="flex justify-between font-semibold"><div>Grand Total</div><div>₹ {total.toFixed(2)}</div></div>
        </div>

        {/* swipe-to-order bar*/}
        <div className="mt-4">
          <div className="relative rounded-full bg-gray-200 h-14 flex items-center px-2 select-none">
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">Swipe to Order</div>
            <input type="range" min="0" max="100" value={swipe} onChange={e=>setSwipe(parseInt(e.target.value)||0)}
              className="w-full h-14 opacity-0 cursor-ew-resize" />
          </div>
          <div className="text-center text-xs text-gray-500 mt-1">{swipe < 95 ? 'Slide to the end →' : 'Ordering…'}</div>
        </div>

        {/* Cooking instructions modal */}
        {showInst && (
          <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center">
            <div className="bg-white rounded-2xl w-[360px] p-4">
              <div className="text-lg font-semibold mb-1">Add Cooking instructions</div>
              <p className="text-xs text-gray-600 mb-3">The restaurant will try its best to follow your request. However, refunds or cancellations in this regard won’t be possible</p>
              <textarea rows="4" className="w-full border rounded p-2" value={inst} onChange={e=>setInst(e.target.value)} />
              <div className="mt-3 flex justify-end gap-2">
                <button className="border rounded-full px-4 py-1" onClick={()=>setShowInst(false)}>Cancel</button>
                <button className="bg-black text-white rounded-full px-4 py-1" onClick={()=>setShowInst(false)}>Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

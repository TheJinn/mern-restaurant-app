import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import NavBar from "../components/NavBar";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
const COLORS = ["var(--chart1)","var(--chart2)","var(--chart3)"];

export default function Analytics(){
  const [metrics, setMetrics] = useState({ chefs: 0, totalRevenue: 0, totalOrders: 0, totalClients: 0 });
  const [rangeRevenue, setRangeRevenue] = useState("daily");
  const [rangeSummary, setRangeSummary] = useState("daily");
  const [ordersRevenue, setOrdersRevenue] = useState([]);
  const [ordersSummary, setOrdersSummary] = useState([]);
  const [tables, setTables] = useState([]);
  const [search, setSearch] = useState("");
  const [highlightKey, setHighlightKey] = useState("");
  const [chefRows, setChefRows] = useState([]);
  const [rangeChef, setRangeChef] = useState("daily");
  const containerCls = "max-w-[1100px] mx-auto p-4 space-y-4";

  useEffect(() => {
    const load = () => api.get('/api/analytics/cards').then(r => setMetrics(r.data));
    load(); const t = setInterval(load, 10000); return ()=>clearInterval(t);
  }, []);

  useEffect(() => {
    const load = () => api.get(`/api/orders?range=${rangeRevenue}`).then(r => setOrdersRevenue(r.data));
    load(); const t = setInterval(load, 10000); return ()=>clearInterval(t);
  }, [rangeRevenue]);

  useEffect(() => {
    const load = () => api.get(`/api/orders?range=${rangeSummary}`).then(r => setOrdersSummary(r.data));
    load(); const t = setInterval(load, 10000); return ()=>clearInterval(t);
  }, [rangeSummary]);

  useEffect(() => { api.get(`/api/analytics/chef-orders?range=${rangeChef}`).then(r => setChefRows(r.data)); }, [rangeChef]);
  useEffect(() => { api.get('/api/tables').then(r => setTables(r.data)); }, []);

  useEffect(() => {
    const s = search.trim().toLowerCase();
    const map = { 'chef':'chefs','chefs':'chefs','revenue':'revenue','orders':'orders','clients':'clients','customers':'clients','tables':'tables' };
    setHighlightKey(map[s] || '');
  }, [search]);

  const revenueData = useMemo(() => {
    const list = ordersRevenue;
    function fmtMonth(m){ return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m]; }
    function weekOfMonth(d) { const first = new Date(d.getFullYear(), d.getMonth(), 1); const offset = (first.getDay() + 6) % 7; return Math.floor((d.getDate() + offset - 1) / 7) + 1; }
    if (rangeRevenue === 'daily') {
      const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      const sums = Object.fromEntries(labels.map(l=>[l,0]));
      list.forEach(o=>{ const d=new Date(o.createdAt); const day = labels[d.getDay()===0?6:d.getDay()-1]; sums[day]+= (o.total||0); });
      return labels.map(day=>({ label: day, revenue: Math.round(sums[day]) }));
    } else if (rangeRevenue === 'weekly') {
      const weeks = [1,2,3,4,5];
      const sums = Object.fromEntries(weeks.map(w=>[`Week ${w}`,0]));
      list.forEach(o=>{ const d=new Date(o.createdAt); const key = `Week ${weekOfMonth(d)}`; if (key in sums) sums[key]+= (o.total||0); });
      return weeks.map(w=>({ label: `Week ${w}`, revenue: Math.round(sums[`Week ${w}`]) }));
    } else {
      const months = Array.from({length:12}, (_,i)=>fmtMonth(i));
      const sums = Object.fromEntries(months.map(m=>[m,0]));
      list.forEach(o=>{ const d=new Date(o.createdAt); const key = fmtMonth(d.getMonth()); sums[key]+= (o.total||0); });
      return months.map(m=>({ label: m, revenue: Math.round(sums[m]) }));
    }
  }, [ordersRevenue, rangeRevenue]);

  const servedCount   = useMemo(() => ordersSummary.filter(o =>
    o.type === 'DINE_IN' && (o.status === 'SERVED' || o.status === 'DONE' || ((o.remainingMinutes || 0) === 0))
  ).length, [ordersSummary]);
  const dineInCount   = useMemo(() => ordersSummary.filter(o => o.type==='DINE_IN').length, [ordersSummary]);
  const takeAwayCount = useMemo(() => ordersSummary.filter(o => o.type==='TAKEAWAY').length, [ordersSummary]);
  const totalCount = (servedCount + dineInCount + takeAwayCount) || 1;
  const servedBase = Math.max(1, dineInCount);
const servedPct = Math.round((servedCount * 100) / servedBase);
const baseDT = Math.max(1, dineInCount + takeAwayCount);
const dineInPct = Math.round((dineInCount * 100) / baseDT);
const takeAwayPct = Math.round((takeAwayCount * 100) / baseDT);
  const cardCls = (key) => `bg-white rounded-2xl p-4 shadow-card transition ${highlightKey && highlightKey!==key ? "blur-[2px]" : ""} ${highlightKey===key?"ring-2 ring-black":""}`;

  return (
    <div className="flex min-h-screen">
      <NavBar />
      <main className="flex-1">
        <div className={containerCls}>
          <header className="flex items-center gap-3">
            <img src="/logo.svg" className="w-8 h-8" alt="Company"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Type: revenue, orders, clients, chefs, tables" className="border rounded-full px-4 py-2 w-96"/>
          </header>

          <section>
            <div className="grid sm:grid-cols-4 gap-3">
              <div className={cardCls('chefs')}><div className="text-[10px] uppercase tracking-wider text-gray-500">TOTAL CHEF</div><div className="text-3xl font-bold">{String(metrics.chefs||0).padStart(2,'0')}</div></div>
              <div className={cardCls('revenue')}><div className="text-[10px] uppercase tracking-wider text-gray-500">TOTAL REVENUE</div><div className="text-3xl font-bold">₹ {Number(metrics.totalRevenue||0).toLocaleString('en-IN')}</div></div>
              <div className={cardCls('orders')}><div className="text-[10px] uppercase tracking-wider text-gray-500">TOTAL ORDERS</div><div className="text-3xl font-bold">{String(metrics.totalOrders||0).padStart(2,'0')}</div></div>
              <div className={cardCls('clients')}><div className="text-[10px] uppercase tracking-wider text-gray-500">TOTAL CLIENTS</div><div className="text-3xl font-bold">{String(metrics.totalClients||0).padStart(2,'0')}</div></div>
            </div>
          </section>

          <section>
            <div className="grid xl:grid-cols-12 gap-3">
              <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">Revenue — {rangeRevenue[0].toUpperCase()+rangeRevenue.slice(1)}</div>
                  <select className="border rounded px-2 py-1 text-sm" value={rangeRevenue} onChange={e=>setRangeRevenue(e.target.value)}>
                    <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}><Line type="monotone" dataKey="revenue" stroke="var(--chart2)" /><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip /></LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">Order Summary — {rangeSummary[0].toUpperCase()+rangeSummary.slice(1)}</div>
                  <select className="border rounded px-2 py-1 text-sm" value={rangeSummary} onChange={e=>setRangeSummary(e.target.value)}>
                    <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center"><div className="text-sm">Served</div><div className="text-3xl font-bold">{servedCount}</div><div className="text-xs opacity-70">({servedPct}%)</div></div>
                  <div className="text-center"><div className="text-sm">Dine In</div><div className="text-3xl font-bold">{dineInCount}</div><div className="text-xs opacity-70">({dineInPct}%)</div></div>
                  <div className="text-center"><div className="text-sm">Take Away</div><div className="text-3xl font-bold">{takeAwayCount}</div><div className="text-xs opacity-70">({takeAwayPct}%)</div></div>
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie dataKey="value" data={[{name:'Served',value:servedCount},{name:'Dine In',value:Math.max(0,dineInCount - servedCount)},{name:'Take Away',value:takeAwayCount}]} outerRadius={70} label>{[0,1,2].map((i)=>(<Cell key={i} fill={COLORS[i%COLORS.length]} />))}</Pie><Legend/><Tooltip/></PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="xl:col-span-4 bg-white rounded-2xl p-4 shadow-card">
                <div className="flex items-center justify-between mb-1"><div className="font-medium">Tables</div></div>
                <div className="grid grid-cols-5 gap-2">
                  {tables.slice(0,30).map(t => (
                    <div key={t.number} title={`Table ${t.number} • ${t.size} chairs`} className={`rounded-xl border text-center py-2 ${t.reserved?'bg-green-500 text-white':'bg-white'}`}>
                      <div className="text-[10px] uppercase">Table</div>
                      <div className="font-semibold">{String(t.number).padStart(2,'0')}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs"><span className="inline-block w-3 h-3 rounded-full bg-green-500"></span> Reserved <span className="inline-block w-3 h-3 rounded-full border"></span> Available</div>
              </div>
            </div>
          </section>

          <section>
            <div className="bg-white rounded-2xl p-4 shadow-card">
              <div className="flex items-center justify-between pb-2">
                <div className="font-semibold tracking-wide">Chef Orders</div>
                <select className="border rounded px-2 py-1 text-sm" value={rangeChef} onChange={e=>setRangeChef(e.target.value)}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed border-separate border-spacing-y-2">
                  <colgroup><col style={{width:'70%'}}/><col style={{width:'30%'}}/></colgroup>
                  <thead className="text-left text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-3 py-2">Chef Name</th><th className="px-3 py-2">Order Taken</th></tr></thead>
                  <tbody>{chefRows.map(row => (<tr key={row.chefId} className="bg-gray-50"><td className="px-3 py-2 font-medium truncate">{row.name}</td><td className="px-3 py-2 text-right"><span className="inline-block min-w-[3ch]">{String(row.count).padStart(2,'0')}</span></td></tr>))}</tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

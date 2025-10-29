import express from 'express';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Chef from '../models/Chef.js';
import Table from '../models/Table.js';
const router = express.Router();

function computeTotals(items, type) {
  let subtotal = 0; for (const { item, qty } of items) subtotal += (item.price || 0) * qty;
  const tax = +(subtotal * 0.04).toFixed(2);
  const deliveryFee = type === 'TAKEAWAY' ? 50 : 0;
  const total = subtotal + tax + deliveryFee;
  return { subtotal, tax, deliveryFee, total };
}
function computeProcessingMinutes(items) { let mins = 0; for (const { item, qty } of items) mins += (item.averagePreparationTime || 0) * qty; return mins; }
async function pickChef() {
  const chefs = await Chef.find({}).lean();
  if (chefs.length === 0) return null;
  const counts = Object.fromEntries(chefs.map(c => [String(c._id), 0]));
  const processing = await Order.find({ status: 'PROCESSING' }).select('assignedChef').lean();
  for (const o of processing) if (o.assignedChef) counts[String(o.assignedChef)] = (counts[String(o.assignedChef)] || 0) + 1;
  let min = Infinity; for (const id in counts) min = Math.min(min, counts[id]);
  const candidates = chefs.filter(c => counts[String(c._id)] === min);
  return candidates[Math.floor(Math.random()*candidates.length)]._id;
}

router.post('/', async (req, res) => {
  try {
    const { type, tableNumber, customerName, phone, address, members, items, cookingInstructions } = req.body;
    if (type === 'DINE_IN' && !members) return res.status(400).json({ error: 'Members required for DINE_IN' });
    if (type === 'TAKEAWAY' && tableNumber) return res.status(400).json({ error: 'TAKEAWAY should not have a table number' });
    const detailed = [];
    for (const it of items) {
      const item = await MenuItem.findById(it.item);
      if (!item) return res.status(400).json({ error: 'Menu item not found' });
      if (item.stock === false) return res.status(400).json({ error: `Item out of stock: ${item.name}` });
      detailed.push({ item, qty: it.qty || 1 });
    }
    const processingMinutes = computeProcessingMinutes(detailed);
    const totals = computeTotals(detailed, type);
    const chefId = await pickChef();
    let assignedTable = tableNumber || null;
    if (type === 'DINE_IN') {
      if (!assignedTable) {
        const candidates = await Table.find({ reserved: false, size: { $gte: Math.max(1, members||1) } }).sort({ size: 1, number: 1 });
        if (!candidates.length) return res.status(400).json({ error: 'No suitable table available' });
        assignedTable = candidates[0].number;
      }
      const t = await Table.findOne({ number: assignedTable });
      if (!t) return res.status(400).json({ error: 'Table not found' });
      if (t.reserved) return res.status(400).json({ error: 'Selected table already reserved' });
      t.reserved = true; t.persons = members||0; t.name=''; await t.save();
    }
    const order = await Order.create({
      type, tableNumber: type==='DINE_IN' ? assignedTable : null, customerName, phone, address, members,
      items: detailed.map(d => ({ item: d.item._id, qty: d.qty })),
      cookingInstructions: cookingInstructions || '',
      assignedChef: chefId,
      processingMinutes,
      deliveryEtaMinutes: type === 'TAKEAWAY' ? Math.max(30, processingMinutes + 10) : 0,
      subtotal: totals.subtotal, tax: totals.tax, deliveryFee: totals.deliveryFee, total: totals.total
    });
    res.json(order);
  } catch(e){ res.status(400).json({ error: e.message }); }
});

router.get('/', async (req, res) => {
  const { range = 'daily' } = req.query;
  const now = new Date();
  const since = new Date(now);
  if (range === 'weekly') since.setDate(now.getDate()-35);
  else if (range === 'monthly') since.setFullYear(now.getFullYear()-1);
  else since.setDate(now.getDate()-7);

  // mutable docs to allow auto-updates
  const orders = await Order.find({ createdAt: { $gte: since }}).populate('items.item');
  const list = [];
  const updates = [];
  for (const o of orders) {
    const ms = (Date.now() - new Date(o.processingStartedAt).getTime());
    const elapsedMin = Math.floor(ms / 60000);
    const left = Math.max(0, (o.processingMinutes || 0) - elapsedMin);

    if (left === 0 && o.status === 'PROCESSING') {
      if (o.type === 'DINE_IN') {
        updates.push((async () => {
          o.status = 'SERVED';
          await o.save();
          if (o.tableNumber) {
            const t = await Table.findOne({ number: o.tableNumber });
            if (t) { t.reserved = false; t.persons = 0; t.name = ''; await t.save(); }
          }
        })());
        list.push({ ...(o.toObject()), remainingMinutes: 0, status: 'SERVED' });
      } else {
        updates.push((async () => { o.status = 'PICKED_UP'; await o.save(); })());
        list.push({ ...(o.toObject()), remainingMinutes: 0, status: 'PICKED_UP' });
      }
    } else {
      const status = (left === 0 && o.status === 'PROCESSING') ? 'DONE' : o.status;
      list.push({ ...(o.toObject()), remainingMinutes: left, status });
    }
  }
  await Promise.all(updates);
  res.json(list);
});

router.post('/:id/status', async (req, res) => {
  const { status } = req.body;
  const previous = await Order.findById(req.params.id);
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (previous && previous.type === 'DINE_IN' && status === 'SERVED' && previous.tableNumber) {
    const t = await Table.findOne({ number: previous.tableNumber });
    if (t) { t.reserved = false; t.persons = 0; t.name = ''; await t.save(); }
  }
  res.json(order);
});

router.get('/summary/metrics', async (_req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenue = (await Order.aggregate([ { $group: { _id: null, sum: { $sum: '$total' }}} ]))[0]?.sum || 0;
  const totalClients = (await Order.distinct('phone')).filter(Boolean).length;
  res.json({ totalOrders, totalRevenue, totalClients });
});

export default router;

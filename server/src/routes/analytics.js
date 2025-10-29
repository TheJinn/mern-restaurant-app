import express from 'express';
import Order from '../models/Order.js';
import Chef from '../models/Chef.js';
const router = express.Router();

router.get('/cards', async (_req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenue = (await Order.aggregate([ { $group: { _id: null, sum: { $sum: '$total' }}} ]))[0]?.sum || 0;
  const totalClients = (await Order.distinct('phone')).filter(Boolean).length;
  const chefs = await Chef.countDocuments();
  res.json({ chefs, totalRevenue, totalOrders, totalClients });
});

router.get('/chef-orders', async (req, res) => {
  const { range = 'daily' } = req.query;
  const now = new Date();
  const since = new Date(now);
  if (range === 'weekly') since.setDate(now.getDate() - 35);
  else if (range === 'monthly') since.setFullYear(now.getFullYear() - 1);
  else since.setDate(now.getDate() - 7);

  const chefs = await Chef.find({}).lean();
  const counts = Object.fromEntries(chefs.map(c => [String(c._id), 0]));
  const grouped = await Order.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: "$assignedChef", count: { $sum: 1 } } }
  ]);
  for (const g of grouped) { if (g._id) counts[String(g._id)] = g.count; }
  const list = chefs.map(c => ({ chefId: String(c._id), name: c.name, count: counts[String(c._id)] || 0 }));
  res.json(list);
});

export default router;

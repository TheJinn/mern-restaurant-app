import { Router } from 'express';
import MenuItem from '../models/MenuItem.js';

const router = Router();

router.get('/', async (req, res) => {
  const { q = '', category, page = 1, limit = 1000 } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (q) filter.name = { $regex: q, $options: 'i' };

  const items = await MenuItem.find(filter)
    .select('name price rating stock productImage category prepTime isVeg description')
    .sort({ name: 1 })
    .skip((+page - 1) * +limit)
    .limit(+limit)
    .lean();

  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=59');
  res.json({ items });
});

router.get('/byIds', async (req, res) => {
  const ids = String(req.query.ids || '')
    .split(',').map(s=>s.trim()).filter(Boolean);
  if (!ids.length) return res.json({ items: [] });

  const items = await MenuItem.find({ _id: { $in: ids } })
    .select('name price rating stock productImage category prepTime isVeg description')
    .lean();

  res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=30');
  res.json({ items });
});

router.post('/', async (req, res) => {
  const body = req.body || {};
  if (!body.name) return res.status(400).json({ error: 'name required' });
  if (!body.category) return res.status(400).json({ error: 'category required' });

  try {
    const doc = await MenuItem.create(body);
    res.status(201).json({ ok:true, item: doc });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to create item' });
  }
});

export default router;

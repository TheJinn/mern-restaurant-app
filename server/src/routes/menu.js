import express from 'express';
import MenuItem from '../models/MenuItem.js';
const router = express.Router();

router.post('/', async (req, res) => {
  try { const item = await MenuItem.create(req.body); res.json(item); }
  catch(e){ res.status(400).json({ error: e.message }); }
});

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, q } = req.query;
    const where = {};
    if (category) where.category = category;
    if (q) where.name = { $regex: q, $options: 'i' };
    const items = await MenuItem.find(where).skip((page-1)*limit).limit(parseInt(limit)).lean();
    const count = await MenuItem.countDocuments(where);
    res.json({ items, hasMore: (parseInt(limit) * page) < count });
  } catch(e){ res.status(400).json({ error: e.message }); }
});

router.get('/categories', async (_req, res) => {
  const cats = await MenuItem.distinct('category');
  res.json(cats.filter(Boolean));
});

export default router;

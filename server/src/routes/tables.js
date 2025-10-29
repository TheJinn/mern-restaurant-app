import express from 'express';
import Table from '../models/Table.js';
const router = express.Router();
const MAX_TABLES = 30;
async function resequence() {
  const tables = await Table.find({}).sort({ number: 1 });
  for (let i = 0; i < tables.length; i++) {
    if (tables[i].number !== i + 1) { tables[i].number = i + 1; await tables[i].save(); }
  }
}
router.get('/', async (_req, res) => { const tables = await Table.find({}).sort({ number: 1 }).lean(); res.json(tables); });
router.post('/', async (req, res) => {
  try {
    const current = await Table.countDocuments();
    if (current >= MAX_TABLES) return res.status(400).json({ error: `Maximum tables (${MAX_TABLES}) reached` });
    const { size = 2 } = req.body;
    const last = await Table.find({}).sort({ number: -1 }).limit(1);
    const nextNumber = last.length ? last[0].number + 1 : 1;
    const t = await Table.create({ number: nextNumber, size, reserved: false });
    res.json(t);
  } catch(e){ res.status(400).json({ error: e.message }); }
});
router.delete('/:number', async (req, res) => {
  const t = await Table.findOne({ number: req.params.number });
  if (!t) return res.status(404).json({ error: 'Table not found' });
  if (t.reserved) return res.status(400).json({ error: 'Reserved tables cannot be deleted' });
  await Table.deleteOne({ _id: t._id }); await resequence(); res.json({ ok: true });
});
export default router;

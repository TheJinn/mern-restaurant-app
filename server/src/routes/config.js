import express from 'express';
import Chef from '../models/Chef.js';
const router = express.Router();
router.post('/seed-chefs', async (_req, res) => {
  const count = await Chef.countDocuments();
  if (count === 0) await Chef.insertMany([{ name:'Manesh' },{ name:'Pritam' },{ name:'Yash' },{ name:'Tenzen' }]);
  res.json({ ok: true });
});
export default router;

// seed-menu-with-images.js
// Usage:
//   MONGO_URL="mongodb://127.0.0.1:27017/restaurant"   //   MENU_JSON="./menu.sample.by-filename.json"   //   IMG_MAP_JSON="../_img_base64/base64_images.datauri.json"   //   node seed-menu-with-images.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/restaurant';
const MENU_JSON = process.env.MENU_JSON || path.join(__dirname, 'menu.sample.by-filename.json');
const IMG_MAP_JSON = process.env.IMG_MAP_JSON || path.join(__dirname, '../_img_base64/base64_images.datauri.json');

// Adjust this schema to your backend schema if needed
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, enum: ['Burger','Pizza','Salad','Dessert','Drink'], required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  stock: { type: Boolean, default: true },
  productImage: { type: String },      // data URI
  prepTime: { type: Number, default: 10 },
  isVeg: { type: Boolean, default: true },
  description: String
}, { timestamps: true });

const MenuItem = mongoose.model('MenuItem', itemSchema, 'menuitems');

(async () => {
  try {
    const rawMenu = JSON.parse(fs.readFileSync(MENU_JSON, 'utf8'));
    const imgMap = JSON.parse(fs.readFileSync(IMG_MAP_JSON, 'utf8'));

    // Merge filename -> Data URI
    const ready = rawMenu.map(it => ({
      ...it,
      productImage: it.productImage && imgMap[it.productImage] ? imgMap[it.productImage] : it.productImage
    }));

    await mongoose.connect(MONGO_URL);
    let inserted = 0, updated = 0;

    for (const doc of ready) {
      const res = await MenuItem.findOneAndUpdate(
        { name: doc.name },
        { $set: doc },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      // Simple heuristic to count insert/update
      if (res && res.createdAt && (Date.now() - res.createdAt.getTime()) < 10000) inserted++;
      else updated++;
    }

    console.log(`Seed complete. Inserted: ${inserted}, Updated: ${updated}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
})();

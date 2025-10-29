import mongoose from 'mongoose';
const MenuItemSchema = new mongoose.Schema({
  productImage: { type: String, default: '' },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  averagePreparationTime: { type: Number, required: true },
  category: { type: String, index: true },
  stock: { type: Boolean, default: true },
  rating: { type: Number, default: 0 }
}, { timestamps: true });
export default mongoose.model('MenuItem', MenuItemSchema);

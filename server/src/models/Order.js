import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';
const idGen = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);

const OrderItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  qty: { type: Number, default: 1 }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, default: () => idGen(), unique: true },
  type: { type: String, enum: ['DINE_IN', 'TAKEAWAY'], required: true },
  tableNumber: { type: Number, default: null },
  customerName: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  members: { type: Number, default: 0 },
  items: [OrderItemSchema],
  cookingInstructions: { type: String, default: '' },
  assignedChef: { type: mongoose.Schema.Types.ObjectId, ref: 'Chef', default: null },
  status: { type: String, enum: ['PROCESSING','DONE','SERVED','PICKED_UP','NOT_PICKED'], default: 'PROCESSING' },
  processingStartedAt: { type: Date, default: () => new Date() },
  processingMinutes: { type: Number, default: 0 },
  deliveryEtaMinutes: { type: Number, default: 40 },
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);

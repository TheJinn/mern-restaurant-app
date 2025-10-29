import mongoose from 'mongoose';
const TableSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  size: { type: Number, enum: [2,4,6,8], required: true },
  reserved: { type: Boolean, default: false },
  name: { type: String, default: '' },
  persons: { type: Number, default: 0 }
}, { timestamps: true });
export default mongoose.model('Table', TableSchema);

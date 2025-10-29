import mongoose from 'mongoose';
const ChefSchema = new mongoose.Schema({ name: { type: String, required: true } }, { timestamps: true });
export default mongoose.model('Chef', ChefSchema);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
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
const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);
const items = [
  { name: 'Margherita Pizza', description: 'Tomato, mozzarella, basil, EVOO.', price: 299, averagePreparationTime: 12, category: 'Pizza', stock: true,  rating: 4.6, productImage: 'https://picsum.photos/seed/pizza-margherita/800/600' },
  { name: 'Pepperoni Pizza', description: 'Pepperoni, mozzarella, house sauce.', price: 349, averagePreparationTime: 14, category: 'Pizza', stock: true,  rating: 4.7, productImage: 'https://picsum.photos/seed/pizza-pepperoni/800/600' },
  { name: 'Chicken Biryani', description: 'Hyderabadi style, raita on side.', price: 279, averagePreparationTime: 18, category: 'Indian', stock: true,  rating: 4.8, productImage: 'https://picsum.photos/seed/chicken-biryani/800/600' },
  { name: 'Veg Biryani', description: 'Seasonal vegetables, aromatic basmati.', price: 239, averagePreparationTime: 16, category: 'Indian', stock: true,  rating: 4.4, productImage: 'https://picsum.photos/seed/veg-biryani/800/600' },
  { name: 'Butter Chicken', description: 'Creamy tomato gravy, tender chicken.', price: 329, averagePreparationTime: 20, category: 'Indian', stock: true,  rating: 4.7, productImage: 'https://picsum.photos/seed/butter-chicken/800/600' },
  { name: 'Paneer Tikka', description: 'Spiced paneer cubes, mint chutney.', price: 259, averagePreparationTime: 15, category: 'Indian', stock: true,  rating: 4.5, productImage: 'https://picsum.photos/seed/paneer-tikka/800/600' },
  { name: 'Caesar Salad', description: 'Crisp lettuce, parmesan, croutons.', price: 179, averagePreparationTime: 8, category: 'Salad', stock: true,  rating: 4.3, productImage: 'https://picsum.photos/seed/caesar-salad/800/600' },
  { name: 'Greek Salad', description: 'Feta, olives, tomatoes, cucumber.', price: 189, averagePreparationTime: 8, category: 'Salad', stock: true,  rating: 4.2, productImage: 'https://picsum.photos/seed/greek-salad/800/600' },
  { name: 'Cheeseburger', description: 'Grilled patty, cheddar, house sauce.', price: 229, averagePreparationTime: 10, category: 'Burger', stock: true,  rating: 4.4, productImage: 'https://picsum.photos/seed/cheeseburger/800/600' },
  { name: 'Veggie Burger', description: 'Crispy veg patty, fresh greens.', price: 209, averagePreparationTime: 10, category: 'Burger', stock: false, rating: 4.1, productImage: 'https://picsum.photos/seed/veggie-burger/800/600' },
  { name: 'Gulab Jamun', description: 'Warm milk-solid dumplings in syrup.', price: 129, averagePreparationTime: 6, category: 'Dessert', stock: true,  rating: 4.9, productImage: 'https://picsum.photos/seed/gulab-jamun/800/600' },
  { name: 'Chocolate Brownie', description: 'Fudgy brownie, optional ice cream.', price: 149, averagePreparationTime: 7, category: 'Dessert', stock: true,  rating: 4.6, productImage: 'https://picsum.photos/seed/choco-brownie/800/600' },
  { name: 'Masala Chai', description: 'Spiced milk tea, aromatic blend.', price: 69, averagePreparationTime: 5, category: 'Drink', stock: true,  rating: 4.8, productImage: 'https://picsum.photos/seed/masala-chai/800/600' },
  { name: 'Fresh Lime Soda', description: 'Sweet or salted, chilled.', price: 79, averagePreparationTime: 3, category: 'Drink', stock: true,  rating: 4.2, productImage: 'https://picsum.photos/seed/fresh-lime-soda/800/600' },
  { name: 'Tandoori Roti', description: 'Whole wheat, clay-oven baked.', price: 29, averagePreparationTime: 2, category: 'Breads', stock: true,  rating: 4.1, productImage: 'https://picsum.photos/seed/tandoori-roti/800/600' },
  { name: 'Garlic Naan', description: 'Soft leavened bread with garlic.', price: 39, averagePreparationTime: 3, category: 'Breads', stock: false, rating: 4.5, productImage: 'https://picsum.photos/seed/garlic-naan/800/600' }
];
(async () => { const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern_restaurant_suite'; await mongoose.connect(uri); const inserted = await MenuItem.insertMany(items); console.log(`Inserted ${inserted.length} items.`); await mongoose.disconnect(); process.exit(0); })();

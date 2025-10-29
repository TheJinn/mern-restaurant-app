import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const allowed = [
  'https://mern-restaurant-app.netlify.app/',
  'https://mern-restaurant-app-user.netlify.app/'
];

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // allow curl/postman
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: false
}));
app.use(express.json());
app.use(morgan('dev'));

import './models/MenuItem.js';
import './models/Table.js';
import './models/Chef.js';
import './models/Order.js';

import menuRoutes from './routes/menu.js';
import tableRoutes from './routes/tables.js';
import orderRoutes from './routes/orders.js';
import analyticsRoutes from './routes/analytics.js';
import configRoutes from './routes/config.js';

app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/config', configRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mern_restaurant_suite";
mongoose.connect(MONGODB_URI).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on :${PORT}`));
}).catch(err => { console.error('Mongo error', err); process.exit(1); });

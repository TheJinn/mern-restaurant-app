# MERN Restaurant app

## Overview
A full‑stack restaurant suite built on **MERN** with two frontends using the **same backend**:
- **Restaurant site** (manager/chef ops)
- **User site** (customer ordering, mobile‑portrait UI)

Both UIs follow the provided design files, and behavior follows the SRD.

---

## Tech Stack
- **MongoDB** (menu, tables, orders, chefs)
- **Express + Node** (REST API, business rules, auto‑table assignment)
- **React + Vite** (two separate SPAs)
- **Tailwind** (styling), **Recharts** (analytics), **Axios** (API)

---

## Structure & Ports
```
server/           # Express API (default: http://localhost:4000)
restaurant/       # Restaurant site (default: http://localhost:5173)
user/             # User site (default: http://localhost:5174)
```
Set `VITE_API_URL` in each frontend to point to the server.

---

## Setup

### Prereqs
- Node 18+ and npm
- MongoDB running locally (or Atlas URI)

### 1) Server
```bash
cd server
npm i
npm run dev
```

### 2) Restaurant site
```bash
cd restaurant
npm i
npm run dev
```

### 3) User site
```bash
cd user
npm i
npm run dev
```

---

## Environment Variables
- **Server**: `MONGO_URL`, `PORT` (default 4000)
- **Restaurant/User**: `VITE_API_URL` (default `http://localhost:4000`)
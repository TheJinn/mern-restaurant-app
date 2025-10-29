# User UI v6 (Mobile Portrait)

- 414px centered mobile viewport on all screens
- Startup modal blocks scroll/clicks; Dine-In/Take-Away; members only for Dine-In
- Menu: fixed title/search/categories/Next, server-side search+category filters, item ratings
- Checkout: single cooking-instructions popup, +/- qty, remove item, empty-cart view
- Swipe-to-Order pill; Thank You green screen resets details then redirects

## Run
```bash
cp .env.example .env           # Set VITE_API_URL if needed
npm i
npm run dev
```
Default API URL: `http://localhost:4000`

# E-commerce Importation App

Full-stack e-commerce platform focused on imported products with warehouse, customs, and local delivery tracking (Ghana-focused).

## Project Structure

```
ecommerce-importation-app/
├── backend/          # Node.js + Express + MongoDB API
├── frontend/         # Next.js + Tailwind (coming next)
└── mobile/           # React Native Expo (later)
```

## Current Status

✅ **Backend completed**
- JWT Auth (Customer + Admin)
- Product management with importation fields
- Order system + status tracking
- Cart model
- Database seeder with sample data
- Paystack-ready payment flow

## How to Run Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env (especially MONGODB_URI and JWT_SECRET)

# Make sure MongoDB is running
npm run seed     # optional - creates admin + sample products
npm run dev
```

API runs at: http://localhost:5000

## Seeded Login Credentials

| Role     | Email                | Password    |
|----------|----------------------|-------------|
| Admin    | admin@example.com    | admin123    |
| Customer | customer@example.com | customer123 |

## Next Steps
1. Frontend (Next.js + Tailwind)
2. Paystack integration
3. Admin dashboard
4. Mobile app (React Native)

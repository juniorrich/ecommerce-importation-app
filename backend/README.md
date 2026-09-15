# E-commerce Importation App - Backend API

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Paystack (payment ready)

## Setup Instructions

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI, JWT secret, etc.
   ```

3. **Start MongoDB** (make sure MongoDB is running locally or use MongoDB Atlas)

4. **Seed the database** (optional but recommended)
   ```bash
   npm run seed
   ```

5. **Run the server**
   ```bash
   npm run dev     # development with nodemon
   # or
   npm start       # production
   ```

Server will run on `http://localhost:5000`

## Default Seeded Accounts
| Role     | Email                  | Password     |
|----------|------------------------|--------------|
| Admin    | admin@example.com      | admin123     |
| Customer | customer@example.com   | customer123  |

## API Endpoints

### Auth
- `POST /api/auth/register` - Register customer
- `POST /api/auth/login` - Login
- `GET  /api/auth/me` - Get current user (Protected)
- `PUT  /api/auth/updatedetails` - Update profile (Protected)

### Products
- `GET    /api/products` - List products (search, filter, pagination)
- `GET    /api/products/:id` - Get single product
- `GET    /api/products/categories/list` - Get categories
- `POST   /api/products` - Create product (Admin)
- `PUT    /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create order (Protected)
- `GET  /api/orders/myorders` - My orders (Protected)
- `GET  /api/orders/:id` - Get order details (Protected)
- `PUT  /api/orders/:id/pay` - Mark as paid (Protected)
- `GET  /api/orders` - All orders (Admin)
- `PUT  /api/orders/:id/status` - Update status (Admin)

### Health
- `GET /api/health` - API health check

## Importation Features
Products have special fields:
- `originCountry`
- `importationStatus` (sourcing → purchased → in_transit → customs → arrived → in_warehouse → available)
- `customsStatus` (pending / cleared / held)
- `warehouseLocation`

Only products with `importationStatus: "available"` are shown to customers.

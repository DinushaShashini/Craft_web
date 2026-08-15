# IMO Craft API

Node.js + Express + MongoDB backend for the IMO Craft e-commerce storefront.

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Edit `.env` with your MongoDB URI, JWT secret, and admin credentials.

3. Install dependencies:

```bash
npm install
```

4. Seed the database (categories, products, admin user):

```bash
npm run seed
```

5. Start the server:

```bash
npm run dev
```

The API runs at `http://localhost:5000` by default.

## API Endpoints

### Auth (`/api/auth`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/register` | Public | Register a customer account |
| POST | `/login` | Public | Login and receive JWT |
| POST | `/logout` | Authenticated | Invalidate current JWT |
| GET | `/me` | Authenticated | Get current user |

### Products (`/api/products`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Public | List products (filter: `?category=`, `?featured=true`) |
| GET | `/:id` | Public | Get product by ID |
| POST | `/` | Admin | Create product |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Delete product |

### Categories (`/api/categories`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/` | Public | List categories with product counts |
| POST | `/` | Admin | Create category |
| PUT | `/:id` | Admin | Update category |
| DELETE | `/:id` | Admin | Delete category |

### Orders (`/api/orders`)

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/` | Public | Place a new order |
| GET | `/` | Admin | List all orders |
| GET | `/:id` | Public* | Get order by ID or order number |
| PUT | `/:id/status` | Admin | Update order status |

\* Guest order lookup requires `?phone=` matching the order phone number. Admins can access any order with a valid JWT.

## Authentication

Send the JWT in the `Authorization` header:

```
Authorization: Bearer <token>
```

Admin-only routes require a user with `role: "admin"`.

## Order Statuses

`pending` → `confirmed` → `processing` → `shipped` → `delivered` (or `cancelled`)

## Environment Variables

See `.env.example` for all supported variables. Never commit `.env` or hard-code secrets.

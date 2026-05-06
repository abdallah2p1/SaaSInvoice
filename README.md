# InvoiceOS — Backend API

MERN Stack REST API for the InvoiceOS freelance management app.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env
# Then edit .env and set your MONGO_URI and JWT_SECRET

# 3. Run in development
npm run dev

# 4. Run in production
npm start
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user (protected) |

### Clients (all protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/clients | Get all clients |
| GET | /api/clients/:id | Get single client |
| POST | /api/clients | Create client |
| PUT | /api/clients/:id | Update client |
| DELETE | /api/clients/:id | Delete client |

### Invoices (all protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/invoices | Get all invoices |
| GET | /api/invoices/stats | Dashboard stats |
| GET | /api/invoices/:id | Get single invoice |
| POST | /api/invoices | Create invoice |
| PUT | /api/invoices/:id | Update invoice |
| PATCH | /api/invoices/:id/status | Update status only |
| DELETE | /api/invoices/:id | Delete invoice |

## Auth Header
All protected routes need:
```
Authorization: Bearer <your_token>
```

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

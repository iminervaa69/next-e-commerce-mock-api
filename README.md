# Mock API Server

<p align="center">
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
</p>

<p align="center">
  A standalone mock API server that simulates Biteship and Xendit APIs for development and testing. Build and test your e-commerce integrations without incurring real API costs.
</p>

---

## Features

- **Biteship API Simulation** — Couriers, shipping rates, orders, and tracking
- **Distance-based Pricing** — Real distance calculations using OSRM
- **Webhook Simulation** — Test order status update flows
- **Xendit Payment Channels** — Mock payment gateway responses
- **Biteship-compatible Format** — Drop-in replacement for development

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/mock-api-server.git
cd mock-api-server

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Setup database
npm run db:push
npm run db:seed

# Start server
npm run dev
```

The server will be running at `http://localhost:3002`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3002) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SERVER_URL` | Public server URL | Yes (for production) |
| `MOCK_API_KEY` | API authentication key | Yes |
| `MOCK_API_SECRET` | API authentication secret | Yes |

## API Reference

### Biteship Compatible Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/couriers` | List available couriers |
| `POST` | `/v1/rates/couriers` | Calculate shipping rates |
| `POST` | `/v1/orders` | Create shipping order |
| `POST` | `/v1/orders/:id/status` | Update order status |
| `GET` | `/v1/trackings/:waybill_id` | Track shipment |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/couriers` | List all couriers with rates |
| `GET` | `/admin/orders` | List all mock orders |

### System Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API information |
| `GET` | `/health` | Health check |
| `POST` | `/api/config` | Get server config (authenticated) |

## Deployment

### Railway (Recommended)

1. Create a new project on [Railway](https://railway.app)
2. Add a **PostgreSQL** database from the Railway dashboard
3. Deploy from GitHub repository
4. Set environment variables in Railway dashboard
5. Railway auto-injects `DATABASE_URL`
6. Enable **Serverless** to save costs (scales to zero when idle)

### Post-Deploy Setup

```bash
# Run via Railway CLI or dashboard shell
npx prisma db push
npx prisma db seed
```

## Response Format

All responses match the real Biteship API format with additional mock metadata:

```json
{
  "success": true,
  "pricing": [...],
  "_mock": true,
  "_distance_km": 45.2
}
```

## Integration

```typescript
const MOCK_API_URL = 'https://your-mock-api.up.railway.app'

const response = await fetch(`${MOCK_API_URL}/v1/rates/couriers`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    origin_postal_code: 12345,
    destination_postal_code: 67890,
    couriers: 'jne,jnt,sicepat',
    items: [{ weight: 1000 }]
  })
})
```

## License

MIT © 2024

# Vision Gateway

Multi-tenant NestJS API for tenant, user, auth, and student operations.

## Quick Start

### Requirements

- Node.js (LTS recommended)
- MongoDB instance

### Environment

Create `.env` in `vision_gateway`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/vision_gateway
JWT_SECRET=replace-with-a-strong-secret
```

### Run

```bash
npm install
npm run start:dev
```

Base URL: `http://localhost:3000`

## Documentation

- Full REST API guide: [`docs/API.md`](docs/API.md)

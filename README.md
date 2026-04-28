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

## Seed Global Registration Defaults

The registration defaults fallback is stored in the main database `system_config` collection under key `registration_options_default`.

Run:

```bash
npm run seed:registration-defaults
```

Behavior:
- Tenant override exists -> tenant options are returned.
- Tenant override missing -> global default from `system_config` is returned.
- Global default missing/invalid -> safe in-code fallback defaults are used.

Tenant overrides are stored in each tenant database under `tenant_config`.
If you have legacy data in `registration_options`, migrate it:

```bash
npm run migrate:tenant-config-collection
```

## Documentation

- Full REST API guide: [`docs/API.md`](docs/API.md)

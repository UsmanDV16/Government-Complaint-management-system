# Government Complaint Management System (MERN)

Full MERN implementation with three roles:
- Admin: verify complaints, manage departments and users.
- Department: resolve complaints, add resolution proofs, manage complaint types.
- Citizen: register with CNIC, submit complaints with proofs, rate resolutions.

Complaint statuses: `unresolved` → `resolved` (verification pending) → `verified`.
If a verified complaint receives a 1–2 star rating, it returns to `resolved` and the rating resets.

## Requirements
- Node.js 18+
- MongoDB Atlas (or local MongoDB)
- Cloudinary account (for proofs)

## Setup

### 1) Backend
```bash
cd server
npm install
```

Copy `.env.example` to `.env` and fill in:
- `MONGO_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `ADMIN_CNIC`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`

Start the server:
```bash
npm run dev
```

### 2) Frontend
```bash
npm install
npm run dev
```

Optional (if not using Vite proxy): create `.env` at project root with:
```
VITE_API_URL=http://localhost:4000/api
```

## MongoDB Atlas Setup
1. Create a cluster in Atlas.
2. Create a database user and password.
3. Add your IP in Network Access.
4. Copy the connection string and set `MONGO_URI`.

## Cloudinary Setup
1. Create a Cloudinary account.
2. Find your Cloud Name, API Key, and API Secret.
3. Put them in the server `.env` file.

## Seeded Admin
On first server start, a default admin is created from the `.env` values.
Use that account to create departments and department users.

# DigiRoute — Main Server (Next.js Application)

This directory contains the primary fullstack Next.js application powering DigiRoute's user interface, API routes, database connections, and Cloudinary media processing.

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in this directory with the following configuration:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

### 4. Build for Production

```bash
npm run build
npm run start
```

---

## Key Directories

* **`app/`:** Next.js App Router containing route pages and API Route Handlers.
* **`components/`:** Reusable UI components including modals, toolbars, and canvas backgrounds.
* **`lib/`:** Core utilities for CEPT DIGIPIN encoding/decoding, database connection pooling, and JWT authentication.
* **`models/`:** Mongoose data models for User and Card documents.
* **`public/`:** Static assets, PWA manifest, and application icons.

# Sheth PET & Polymers - MERN Stack Application

A full-stack web application for Sheth PET & Polymers Pvt. Ltd., built with React, Node.js, Express, MongoDB, and Tailwind CSS.

---

## Project Structure

```text
Sheth-pet/
├── .github/
│   └── workflows/
│       └── deploy.yml        # Automated CI/CD pipeline for Hostinger
├── backend/
│   ├── db/                   # MongoDB connection & initial admin seeding
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API endpoints
│   ├── uploads/              # Uploaded media assets
│   ├── index.js              # Express app entry & static file serving
│   ├── package.json
│   └── .env.example
├── client/
│   ├── src/                  # React components & pages
│   ├── vite.config.js        # Vite config (builds to ../backend/dist)
│   └── package.json
├── ecosystem.config.cjs      # PM2 process manager config for production
├── package.json              # Monorepo root scripts
├── HOSTINGER_DEPLOYMENT.md   # Detailed step-by-step Hostinger deployment guide
└── .gitignore
```

---

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Configure Environment
Create `backend/.env` based on `backend/.env.example`.

### 3. Run Development Servers
- **Backend**:
  ```bash
  npm run server
  ```
- **Frontend**:
  ```bash
  npm run client
  ```

---

## Production Build

To build the frontend and bundle it into `backend/dist` for serving via Express:
```bash
npm run build
npm start
```

---

## Deployment to Hostinger

For automated deployment via GitHub to Hostinger (VPS or Cloud/Business hosting), refer to the full step-by-step guide in [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md).

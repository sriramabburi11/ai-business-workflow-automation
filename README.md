# AI Business Workflow Automation Platform (NexusAI)

> Built for the **Smart Automation Hackathon** • Powered by Google Gemini 2.5 Flash

NexusAI is a full-stack, enterprise-grade AI workflow automation platform that streamlines approvals, document processing, task routing, and policy checks using Google Gemini AI.

---

## Key Features

- ⚡ **AI Natural Language Workflow Generator**: Describe any business process in plain text; Gemini constructs step sequences, roles, risk checks, and notifications.
- 📄 **Multimodal AI Document Extraction**: Upload invoices, agreements, or tax documents for instant OCR and tabular data extraction.
- 🛡️ **AI Approval Risk Assessment Engine**: Automatic risk scoring (0-100) and policy violation recommendations for approval sign-offs.
- 📊 **Executive Analytics Dashboard**: Interactive Recharts trends tracking workflow volume, decision throughput, and hours saved.
- 🔒 **Role-Based Access Control (RBAC)**: Manage team members with Admin, Manager, Finance, and HR permissions.
- 📜 **Immutable Audit Logs**: Complete security trail tracking every user action, approval decision, and workflow execution.

---

## Tech Stack

### Frontend
- React.js + Vite + TypeScript
- Tailwind CSS (Sleek dark theme & glassmorphism system)
- Recharts
- Lucide Icons
- Axios
- React Hook Form + Zod

### Backend
- Node.js + Express.js + TypeScript
- Prisma ORM (SQLite zero-config out-of-the-box / Supabase PostgreSQL compatible)
- JWT Authentication
- Multer File Upload Engine
- Helmet + Rate Limiting + CORS

### AI Integration
- `@google/generative-ai` SDK
- Gemini 2.5 Flash Model (with intelligent fallback heuristic engine)

---

## Quick Start Guide

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npx ts-node src/seed.ts
npm run dev
```
Backend server will start at: `http://localhost:5000`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend app will start at: `http://localhost:3000`

---

## Evaluation Demo Login
For instant evaluation without registration:
- Click **"One-Click Demo"** on the Login screen to log in instantly as Administrator (`sarah.connor@enterprise.io`).

---

## Master Routes Map

| Route | Description |
| :--- | :--- |
| `/` | Landing Marketing Page |
| `/login` | Authentication Sign-in |
| `/register` | Organization Registration |
| `/dashboard` | Executive Command Center |
| `/workflows` | Active Workflow Pipelines |
| `/workflows/new` | AI Natural Language Workflow Builder |
| `/workflows/:id` | Workflow Detail & Step Engine |
| `/templates` | Pre-built Automation Templates Catalog |
| `/tasks` | Task Automation Board |
| `/approvals` | Governance & Approvals Hub (AI Risk Scores) |
| `/documents` | Smart Document Vault & AI OCR Extractor |
| `/analytics` | Performance & Bottleneck Insights |
| `/settings` | Workspace Settings & RBAC Team Roster |
| `/profile` | User Profile & Security Audit Logs |

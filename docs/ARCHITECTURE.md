# Architecture & Technical Specifications

## Platform Overview
The **AI Business Workflow Automation Platform** (NexusAI) is an enterprise-grade platform that automates complex business processes such as approvals, document extractions, task routing, and policy checks using Google Gemini AI (`@google/generative-ai` with Gemini 2.5 Flash).

```mermaid
graph TD
    User[User / Enterprise Client] -->|HTTP / React Router| Frontend[React + Vite + TypeScript + Tailwind]
    Frontend -->|JWT Authorization Header| API[Express.js REST Server]
    API -->|Prisma Client| DB[(SQLite / Supabase PostgreSQL Database)]
    API -->|@google/generative-ai SDK| Gemini[Google Gemini 2.5 Flash AI]
    API -->|Multer Engine| Uploads[Document Storage Vault]
```

## Security Infrastructure
1. **Server-Side API Key Isolation**: Gemini API key remains strictly on the Express backend server.
2. **JWT Authentication & RBAC**: Every request is authenticated and evaluated against user role privileges (`ADMIN`, `MANAGER`, `FINANCE`, `HR`, `MEMBER`).
3. **Helmet Security**: Strict security HTTP headers preventing XSS and clickjacking.
4. **Rate Limiting**: Rate limiting applied via `express-rate-limit`.
5. **Database Safety**: Prisma ORM parametrized queries preventing SQL Injection.

## Data Schemas
- **User**: Authentication credentials, roles, organization association.
- **Organization**: Workspace multi-tenancy grouping.
- **Workflow**: Automated process definition, trigger configuration, step sequence.
- **WorkflowStep**: Individual step configuration (AI Extraction, Human Approval, Condition Check, Task Assignment, Notification).
- **Task**: Actionable items assigned to role/user with priorities.
- **Approval**: Sign-off requests featuring AI Risk Scores (0-100) and automated recommendations.
- **Document**: Ingested files with extracted JSON fields.
- **AuditLog**: Immutable compliance trail logging user actions.
- **WorkflowExecution**: Run history log trace.

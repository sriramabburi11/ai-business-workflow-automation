# API Endpoint Documentation

## Base URL
`/api`

## Authentication
Every protected route requires a Bearer JWT Token in the request header:
`Authorization: Bearer <JWT_TOKEN>`

---

### Auth Routes
- `POST /auth/register` - Create user and organization
- `POST /auth/login` - Authenticate credentials and receive JWT
- `GET /auth/me` - Fetch authenticated user session

---

### AI Workflow Generation & Analysis
- `POST /ai/generate-workflow` - Prompt-driven AI workflow builder with Gemini 2.5 Flash
- `POST /ai/document-analysis` - Multimodal document OCR & tabular extraction
- `POST /ai/decision-engine` - Approval risk assessment (0-100 score)

---

### Workflows
- `GET /workflows` - List all workflows with step counts
- `POST /workflows` - Create new workflow
- `GET /workflows/:id` - Get workflow details & execution history
- `PUT /workflows/:id` - Update workflow & step sequence
- `DELETE /workflows/:id` - Remove workflow
- `POST /workflows/:id/execute` - Trigger manual workflow execution engine

---

### Tasks & Approvals
- `GET /tasks` - List tasks by status/assignee
- `PUT /tasks/:id` - Update task status
- `GET /approvals` - List pending and historical approvals
- `POST /approvals` - Submit approval decision (APPROVED, REJECTED, CHANGES_REQUESTED)

---

### Documents & Analytics
- `GET /documents` - List uploaded documents
- `POST /documents/upload` - Secure file upload + automated AI extraction
- `GET /analytics` - Executive dashboard metrics & execution trends

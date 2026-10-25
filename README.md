# Trackify (prototype demonstration)

AICTE Approval Workflow Automation, Compliance Monitoring and Alert Management System.
A frontend-only React prototype for demonstration. **Not an official AICTE system.** All data is fictional and stored in your browser's LocalStorage.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

Requires Node 18+.

## Demo login

Open `/login` and either click one of the role buttons (no credentials needed) or choose a role and sign in with any email and any non-empty password. Authentication is simulated; nothing is sent anywhere.

| Role | Opens |
| --- | --- |
| Institute (Rahul Verma, INS-1001) | /institute/dashboard |
| AICTE Officer (Dr. Sanjay Kulkarni) | /officer/dashboard |
| Admin (Kavita Rao) | /admin/dashboard |

The amber **Demo role** button in the top bar switches roles at any time (a demonstration feature, not authentication).

## Suggested demo script

1. As **Institute**: create a new application (4-step wizard), attach five files, submit.
2. Switch to **Officer**: open the new application, start review, mark documents reviewed, request additional documents (or approve/reject in demo mode).
3. Switch back to **Institute**: see the updated status, notification, and respond with documents.
4. As **Admin**: edit a compliance rule, send a simulated alert, view the audit log, export CSV.

Settings > Reset demo data restores the original dataset.

## Structure

```
src/
  components/ layout, common, dashboard, applications, compliance, documents, notifications, charts
  pages/      public, institute, officer, admin, shared
  routes/     AppRoutes.jsx, navConfig.js
  context/    Auth, Data (single shared store), Prefs, Toast
  data/       fictional seed data
  services/   storageService, applicationService, notificationService, auditService, apiClient
  utils/      constants, formatting, schemas (Zod), csv, compliance
```

## Connecting a FastAPI backend later

All writes go through the `actions` object in `src/context/DataContext.jsx`, and persistence goes through `src/services/storageService.js`. Set `VITE_API_BASE_URL` and replace those action bodies with calls to `apiRequest()` in `src/services/apiClient.js`. Pages and components do not need to change.

## What is simulated

- Sign-in, roles and access scoping (frontend only)
- Approvals and rejections (labelled as simulated demo actions)
- Document checks (file type, size, presence only; no OCR or content verification; file contents are never read)
- Compliance rules (illustrative and configurable, not current AICTE regulations)
- Alerts and reminders (in-app only; no email, SMS or real scheduler)
- Audit log (demo events in LocalStorage, not tamper-proof)

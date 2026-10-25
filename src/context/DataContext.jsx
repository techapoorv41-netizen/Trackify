import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { buildSeed, SLICES } from '@/data';
import { load, remove, save } from '@/services/storageService';
import { createAuditEvent } from '@/services/auditService';
import { createNotification } from '@/services/notificationService';
import { initialComplianceItems, nextApplicationId, stageFromStatus } from '@/services/applicationService';
import { nextActionFor } from '@/data/mockCompliance';
import { REQUIRED_DOCS } from '@/utils/constants';
import { addDays, genId } from '@/utils/format';
import { useAuth } from '@/context/AuthContext';

const DataContext = createContext(null);

function init() {
  const seed = buildSeed();
  const state = {};
  SLICES.forEach((key) => {
    state[key] = load(key, seed[key]);
  });
  return state;
}

function reducer(state, action) {
  if (action.type === 'MERGE') return { ...state, ...action.partial };
  if (action.type === 'REPLACE') return action.state;
  return state;
}

const sla = (workflow, id, fallback) => workflow.stages.find((s) => s.id === id)?.slaDays ?? fallback;

export function DataProvider({ children }) {
  const { session } = useAuth();
  const [state, dispatch] = useReducer(reducer, undefined, init);

  const ref = useRef(state);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const previous = useRef(null);
  useEffect(() => {
    SLICES.forEach((key) => {
      if (!previous.current || previous.current[key] !== state[key]) save(key, state[key]);
    });
    previous.current = state;
  }, [state]);

  const actions = useMemo(() => {
    const commit = (partial) => {
      ref.current = { ...ref.current, ...partial };
      dispatch({ type: 'MERGE', partial });
    };

    const actor = () => {
      const s = sessionRef.current;
      const u = ref.current.users.find((x) => x.id === s?.userId);
      return { name: u?.name || 'Demo User', role: s?.role || 'system', instituteId: u?.instituteId || null, id: u?.id };
    };

    const audit = (action, entityType, entityId, description) => {
      const a = actor();
      return createAuditEvent({ actor: a.name, role: a.role, action, entityType, entityId, description });
    };
    const withAudit = (...events) => [...events, ...ref.current.audit].slice(0, 500);
    const withNotes = (...items) => [...items, ...ref.current.notifications].slice(0, 200);
    const historyEvent = (type, text) => {
      const a = actor();
      return { id: genId('EV'), at: new Date().toISOString(), actor: a.name, role: a.role, type, text };
    };
    const mapApp = (id, fn) => ref.current.applications.map((x) => (x.id === id ? fn(x) : x));
    const getApp = (id) => ref.current.applications.find((x) => x.id === id);
    const touch = (app, patch, event) => ({
      ...app,
      ...patch,
      status: patch.status || app.status,
      currentStage: stageFromStatus(patch.status || app.status),
      updatedAt: new Date().toISOString(),
      reviewHistory: event ? [...app.reviewHistory, event] : app.reviewHistory,
    });

    const syncDocs = (appId, files) => {
      const now = new Date().toISOString();
      const all = ref.current.documents;
      const existing = all.filter((d) => d.applicationId === appId);
      const others = all.filter((d) => d.applicationId !== appId);
      const next = REQUIRED_DOCS.filter((r) => files[r.key]).map((r) => {
        const prev = existing.find((d) => d.docKey === r.key);
        const f = files[r.key];
        if (prev && prev.fileName === f.fileName && prev.fileSize === f.fileSize) return prev;
        return {
          id: genId('DOC'), applicationId: appId, docKey: r.key, name: r.name, category: r.category,
          fileName: f.fileName, fileType: f.fileType, fileSize: f.fileSize, uploadedAt: now,
          validationStatus: 'File Received', reviewed: false,
        };
      });
      return [...others, ...next];
    };

    const upsertDeadline = (deadline) => {
      const list = ref.current.deadlines;
      return list.some((d) => d.id === deadline.id) ? list.map((d) => (d.id === deadline.id ? { ...d, ...deadline, completed: false } : d)) : [deadline, ...list];
    };
    const completeDeadlines = (appId, type) =>
      ref.current.deadlines.map((d) => (d.applicationId === appId && (!type || d.type === type) ? { ...d, completed: true } : d));

    return {
      /* ---------- Institute ---------- */
      saveDraft({ form, files, draftId }) {
        const apps = ref.current.applications;
        const existing = draftId ? getApp(draftId) : null;
        const id = existing ? existing.id : nextApplicationId(apps);
        const now = new Date().toISOString();
        const a = actor();
        const base = {
          instituteId: form.instituteId,
          applicationType: form.applicationCategory || 'Extension of Approval',
          academicYear: form.academicYear || '2026-27',
          proposedIntake: Number(form.proposedIntake) || 0,
          programDetails: form.programDetails || '',
        };
        if (existing) {
          commit({ applications: mapApp(id, (x) => touch(x, base)) });
        } else {
          const app = {
            id, ...base, submittedAt: null, createdAt: now, updatedAt: now, status: 'Draft', priority: 'Low', currentStage: 'created',
            assignedReviewerId: null, assignedReviewer: null,
            complianceItems: initialComplianceItems(id, ref.current.rules), reviewHistory: [],
            reviewNotes: '', reviewComplete: false, deficiency: null, decision: null,
          };
          app.reviewHistory = [{ id: genId('EV'), at: now, actor: a.name, role: a.role, type: 'created', text: 'Application created as a draft.' }];
          commit({ applications: [app, ...apps] });
        }
        commit({
          documents: syncDocs(id, files),
          audit: withAudit(audit('Draft Saved', 'Application', id, `Saved draft application ${id}.`)),
        });
        return id;
      },

      submitApplication({ form, files, draftId }) {
        const apps = ref.current.applications;
        const workflow = ref.current.workflow;
        const existing = draftId ? getApp(draftId) : null;
        const id = existing ? existing.id : nextApplicationId(apps);
        const now = new Date().toISOString();
        const a = actor();
        const validationOn = workflow.stages.find((s) => s.id === 'validation')?.enabled;
        const status = validationOn ? 'Validation Pending' : 'Submitted';
        const events = [
          { id: genId('EV'), at: now, actor: a.name, role: a.role, type: 'submitted', text: 'Application submitted by the institute.' },
          { id: genId('EV'), at: now, actor: 'Trackify (demo)', role: 'system', type: 'validation',
            text: validationOn ? 'Queued for automated demo validation (local checks only).' : 'Automated validation stage is disabled in the workflow configuration.' },
        ];
        const fields = {
          instituteId: form.instituteId, applicationType: form.applicationCategory, academicYear: form.academicYear,
          proposedIntake: Number(form.proposedIntake), programDetails: form.programDetails,
          submittedAt: now, status, priority: 'Medium',
        };
        let nextApps;
        if (existing) {
          nextApps = mapApp(id, (x) => ({ ...touch(x, fields), reviewHistory: [...x.reviewHistory, ...events] }));
        } else {
          const created = { id: genId('EV'), at: now, actor: a.name, role: a.role, type: 'created', text: 'Application created.' };
          nextApps = [{
            id, ...fields, createdAt: now, updatedAt: now, currentStage: stageFromStatus(status),
            assignedReviewerId: null, assignedReviewer: null,
            complianceItems: initialComplianceItems(id, ref.current.rules), reviewHistory: [created, ...events],
            reviewNotes: '', reviewComplete: false, deficiency: null, decision: null,
          }, ...apps];
        }
        commit({ applications: nextApps, documents: syncDocs(id, files) });
        commit({
          deadlines: upsertDeadline({
            id: `DL-${id}-review`, title: `Complete scrutiny of ${id}`, applicationId: id, instituteId: form.instituteId,
            dueDate: addDays(now, sla(workflow, 'scrutiny', 14)), priority: 'Medium', audience: 'officer', recipientRole: 'officer',
            reminderFrequency: workflow.reminders.defaultFrequency, reminderStatus: 'Active', completed: false, type: 'review',
          }),
          notifications: withNotes(
            createNotification({ title: 'Application submitted', message: `${id} was submitted. Status: ${status}. This is a demo submission.`, category: 'Application Update', relatedEntityId: id, audience: 'institute', instituteId: form.instituteId }),
            createNotification({ title: 'New application received', message: `${id} is waiting for scrutiny.`, category: 'Application Update', relatedEntityId: id, audience: 'officer' }),
          ),
          audit: withAudit(
            audit('Application Submitted', 'Application', id, `Submitted application ${id} with ${Object.keys(files).length} document(s) (demo).`),
          ),
        });
        return id;
      },

      discardDraft(id) {
        const app = getApp(id);
        if (!app || app.status !== 'Draft') return false;
        commit({
          applications: ref.current.applications.filter((x) => x.id !== id),
          documents: ref.current.documents.filter((d) => d.applicationId !== id),
          deadlines: ref.current.deadlines.filter((d) => d.applicationId !== id),
          audit: withAudit(audit('Draft Discarded', 'Application', id, `Discarded draft ${id}.`)),
        });
        return true;
      },

      addDocument(applicationId, docKey, meta) {
        const req = REQUIRED_DOCS.find((r) => r.key === docKey);
        const app = getApp(applicationId);
        if (!req || !app) return null;
        const doc = {
          id: genId('DOC'), applicationId, docKey, name: req.name, category: req.category,
          fileName: meta.fileName, fileType: meta.fileType, fileSize: meta.fileSize,
          uploadedAt: new Date().toISOString(), validationStatus: 'File Received', reviewed: false,
        };
        commit({
          documents: [...ref.current.documents.filter((d) => !(d.applicationId === applicationId && d.docKey === docKey)), doc],
          applications: mapApp(applicationId, (x) => touch(x, {}, historyEvent('document_added', `Document added: ${req.name} (${meta.fileName}).`))),
          audit: withAudit(audit('Document Added', 'Document', doc.id, `Added ${req.name} to ${applicationId}.`)),
        });
        return doc;
      },

      removeDocument(docId) {
        const doc = ref.current.documents.find((d) => d.id === docId);
        if (!doc) return false;
        commit({
          documents: ref.current.documents.filter((d) => d.id !== docId),
          applications: mapApp(doc.applicationId, (x) => touch(x, {}, historyEvent('document_removed', `Document removed: ${doc.name}.`))),
          audit: withAudit(audit('Document Removed', 'Document', docId, `Removed ${doc.name} from ${doc.applicationId}.`)),
        });
        return true;
      },

      respondToClarification(applicationId, message) {
        const app = getApp(applicationId);
        if (!app || app.status !== 'Documents Required') return false;
        const now = new Date().toISOString();
        const workflow = ref.current.workflow;
        commit({
          applications: mapApp(applicationId, (x) =>
            touch(x, { status: 'Under Review', deficiency: { ...x.deficiency, response: { message, at: now } } },
              historyEvent('clarification_response', `Institute responded: ${message}`))),
          deadlines: upsertDeadline({
            id: `DL-${applicationId}-review`, title: `Complete scrutiny of ${applicationId}`, applicationId, instituteId: app.instituteId,
            dueDate: addDays(now, sla(workflow, 'clarification', 7)), priority: app.priority, audience: 'officer', recipientRole: 'officer',
            reminderFrequency: workflow.reminders.defaultFrequency, reminderStatus: 'Active', completed: false, type: 'review',
          }),
          notifications: withNotes(
            createNotification({ title: 'Institute responded to clarification', message: `A response was recorded on ${applicationId}.`, category: 'Application Update', relatedEntityId: applicationId, audience: 'officer' }),
          ),
          audit: withAudit(audit('Clarification Submitted', 'Application', applicationId, 'Institute responded to the document request.')),
        });
        commit({ deadlines: completeDeadlines(applicationId, 'response') });
        return true;
      },

      /* ---------- Officer ---------- */
      startReview(applicationId) {
        const a = actor();
        const app = getApp(applicationId);
        if (!app || !['Submitted', 'Validation Pending'].includes(app.status)) return false;
        commit({
          applications: mapApp(applicationId, (x) =>
            touch(x, { status: 'Under Review', assignedReviewerId: a.id, assignedReviewer: a.name }, historyEvent('review_started', `Scrutiny started by ${a.name}.`))),
          notifications: withNotes(
            createNotification({ title: 'Application moved to Under Review', message: `${applicationId} is now under officer review.`, category: 'Application Update', relatedEntityId: applicationId, audience: 'institute', instituteId: app.instituteId }),
          ),
          audit: withAudit(audit('Review Started', 'Application', applicationId, `Started review of ${applicationId}.`)),
        });
        return true;
      },

      markDocumentReviewed(docId) {
        const doc = ref.current.documents.find((d) => d.id === docId);
        if (!doc) return false;
        commit({
          documents: ref.current.documents.map((d) =>
            d.id === docId
              ? { ...d, reviewed: true, validationStatus: ['File Received', 'Review Required'].includes(d.validationStatus) ? 'Completeness Check Passed' : d.validationStatus }
              : d),
          applications: mapApp(doc.applicationId, (x) => touch(x, {}, historyEvent('document_reviewed', `Marked ${doc.name} as reviewed.`))),
          audit: withAudit(audit('Document Reviewed', 'Document', docId, `Marked ${doc.name} as reviewed (demo).`)),
        });
        return true;
      },

      saveReviewNotes(applicationId, notes) {
        commit({
          applications: mapApp(applicationId, (x) => touch(x, { reviewNotes: notes }, historyEvent('notes_saved', 'Review notes saved.'))),
          audit: withAudit(audit('Review Notes Saved', 'Application', applicationId, 'Saved review notes (demo).')),
        });
      },

      updateApplicationCompliance(applicationId, itemId, status) {
        commit({
          applications: mapApp(applicationId, (x) =>
            touch(x, { complianceItems: x.complianceItems.map((i) => (i.id === itemId ? { ...i, status } : i)) })),
          audit: withAudit(audit('Compliance Updated', 'Application', applicationId, `Set a compliance item to "${status}" (demo).`)),
        });
      },

      requestDocuments(applicationId, details, items) {
        const app = getApp(applicationId);
        if (!app) return false;
        const now = new Date().toISOString();
        const a = actor();
        const workflow = ref.current.workflow;
        commit({
          applications: mapApp(applicationId, (x) =>
            touch(x, { status: 'Documents Required', reviewComplete: false, deficiency: { reason: details, items, requestedAt: now, requestedBy: a.name } },
              historyEvent('clarification_requested', details))),
          documents: ref.current.documents.map((d) =>
            d.applicationId === applicationId && items.includes(d.name) ? { ...d, validationStatus: 'Missing Information' } : d),
          notifications: withNotes(
            createNotification({ title: 'Additional documents requested', message: `The reviewer asked for more information on ${applicationId}.`, category: 'Document Deficiency', relatedEntityId: applicationId, audience: 'institute', instituteId: app.instituteId }),
          ),
          audit: withAudit(audit('Clarification Requested', 'Application', applicationId, `Requested additional documents (demo): ${details.slice(0, 80)}`)),
        });
        commit({ deadlines: completeDeadlines(applicationId, 'review') });
        commit({
          deadlines: upsertDeadline({
            id: `DL-${applicationId}-response`, title: `Respond to document request on ${applicationId}`, applicationId, instituteId: app.instituteId,
            dueDate: addDays(now, sla(workflow, 'clarification', 7)), priority: app.priority, audience: 'institute', recipientRole: 'institute',
            reminderFrequency: 'Daily', reminderStatus: 'Active', completed: false, type: 'response',
          }),
        });
        return true;
      },

      markReviewComplete(applicationId) {
        commit({
          applications: mapApp(applicationId, (x) => touch(x, { reviewComplete: true }, historyEvent('review_complete', 'Review marked complete.'))),
          audit: withAudit(audit('Review Marked Complete', 'Application', applicationId, 'Marked review complete.')),
        });
      },

      decide(applicationId, outcome, reason) {
        const app = getApp(applicationId);
        if (!app) return false;
        const a = actor();
        const now = new Date().toISOString();
        const approved = outcome === 'Approved';
        commit({
          applications: mapApp(applicationId, (x) =>
            touch(x, {
              status: outcome, reviewComplete: true,
              assignedReviewerId: x.assignedReviewerId || a.id, assignedReviewer: x.assignedReviewer || a.name,
              decision: { outcome, reason: reason || 'Demo checks satisfied.', at: now, by: a.name },
            }, historyEvent(approved ? 'approved' : 'rejected', approved ? 'Demo approval recorded. Simulated outcome only.' : `Demo rejection recorded: ${reason}`))),
          deadlines: completeDeadlines(applicationId),
          notifications: withNotes(
            createNotification({
              title: approved ? 'Demo approval recorded' : 'Demo rejection recorded',
              message: `${applicationId} was ${approved ? 'approved' : 'rejected'} in demo mode. This is a simulated outcome.`,
              category: 'Application Update', relatedEntityId: applicationId, audience: 'institute', instituteId: app.instituteId,
            }),
          ),
          audit: withAudit(audit(approved ? 'Demo Approval Recorded' : 'Demo Rejection Recorded', 'Application', applicationId, `${approved ? 'Demo approval' : 'Demo rejection'} recorded. Simulated outcome only.`)),
        });
        return true;
      },

      /* ---------- Compliance ---------- */
      attachComplianceEvidence(recordId, fileName) {
        const rec = ref.current.compliance.find((r) => r.id === recordId);
        if (!rec) return false;
        commit({
          compliance: ref.current.compliance.map((r) =>
            r.id === recordId
              ? { ...r, evidence: fileName, status: r.status === 'Compliant' ? r.status : 'Evidence Pending', nextAction: 'Awaiting officer review of the attached evidence.', lastUpdated: new Date().toISOString() }
              : r),
          notifications: withNotes(
            createNotification({ title: 'Compliance evidence attached', message: `Evidence was attached for "${rec.requirement}".`, category: 'Compliance', relatedEntityId: rec.instituteId, audience: 'officer' }),
          ),
          audit: withAudit(audit('Compliance Updated', 'Compliance', recordId, `Attached evidence file ${fileName} (demo; not verified).`)),
        });
        return true;
      },

      updateComplianceStatus(recordId, status, note) {
        const rec = ref.current.compliance.find((r) => r.id === recordId);
        if (!rec) return false;
        commit({
          compliance: ref.current.compliance.map((r) =>
            r.id === recordId ? { ...r, status, note: note || r.note, nextAction: nextActionFor(status), lastUpdated: new Date().toISOString() } : r),
          notifications: withNotes(
            createNotification({ title: 'Compliance status updated', message: `"${rec.requirement}" is now ${status} (demo).`, category: 'Compliance', relatedEntityId: rec.instituteId, audience: 'institute', instituteId: rec.instituteId }),
          ),
          audit: withAudit(audit('Compliance Updated', 'Compliance', recordId, `Set compliance status to ${status} (demo).`)),
        });
        return true;
      },

      /* ---------- Notifications ---------- */
      markNotificationRead(id, isRead = true) {
        commit({ notifications: ref.current.notifications.map((n) => (n.id === id ? { ...n, isRead } : n)) });
      },
      markAllNotificationsRead(ids) {
        const set = new Set(ids);
        commit({ notifications: ref.current.notifications.map((n) => (set.has(n.id) ? { ...n, isRead: true } : n)) });
      },
      dismissNotification(id) {
        commit({ notifications: ref.current.notifications.filter((n) => n.id !== id) });
      },

      /* ---------- Admin: users ---------- */
      addUser(data) {
        const user = {
          id: `U-${Date.now().toString(36).toUpperCase()}`, name: data.name, email: data.email, role: data.role,
          organization: data.organization || '', instituteId: data.role === 'institute' ? data.instituteId || null : null,
          designation: data.designation || '', phone: data.phone || '', status: 'Active', createdAt: new Date().toISOString(),
        };
        commit({
          users: [user, ...ref.current.users],
          audit: withAudit(audit('Demo User Modified', 'User', user.id, `Added demo user ${user.name} (${user.role}).`)),
        });
        return user;
      },
      updateUser(id, data) {
        commit({
          users: ref.current.users.map((u) => (u.id === id ? { ...u, ...data, instituteId: (data.role || u.role) === 'institute' ? (data.instituteId ?? u.instituteId) : null } : u)),
          audit: withAudit(audit('Demo User Modified', 'User', id, 'Edited demo user details.')),
        });
      },
      toggleUserStatus(id) {
        const u = ref.current.users.find((x) => x.id === id);
        if (!u) return;
        const next = u.status === 'Active' ? 'Inactive' : 'Active';
        commit({
          users: ref.current.users.map((x) => (x.id === id ? { ...x, status: next } : x)),
          audit: withAudit(audit('Demo User Modified', 'User', id, `Set ${u.name} to ${next}.`)),
        });
      },

      /* ---------- Admin: institutes ---------- */
      addInstitute(data) {
        const nums = ref.current.institutes.map((i) => parseInt(i.id.split('-')[1], 10)).filter((n) => !Number.isNaN(n));
        const id = `INS-${Math.max(1000, ...nums) + 1}`;
        const inst = { id, ...data };
        const records = ref.current.rules.map((rule) => ({
          id: `CR-${id.split('-')[1]}-${rule.id.split('-')[1]}`, instituteId: id, ruleId: rule.id, category: rule.category,
          requirement: rule.name, description: rule.description, status: 'Evidence Pending', academicYear: '2026-27',
          lastUpdated: new Date().toISOString(), evidence: null, nextAction: nextActionFor('Evidence Pending'), note: '',
        }));
        commit({
          institutes: [...ref.current.institutes, inst],
          compliance: [...ref.current.compliance, ...records],
          audit: withAudit(audit('Demo Institute Modified', 'Institute', id, `Added demo institute ${data.name}.`)),
        });
        return inst;
      },
      updateInstitute(id, data) {
        commit({
          institutes: ref.current.institutes.map((i) => (i.id === id ? { ...i, ...data } : i)),
          audit: withAudit(audit('Demo Institute Modified', 'Institute', id, 'Edited demo institute record.')),
        });
      },

      /* ---------- Admin: rules ---------- */
      addRule(data) {
        const nums = ref.current.rules.map((r) => parseInt(r.id.split('-')[1], 10));
        const id = `R-${String(Math.max(0, ...nums) + 1).padStart(3, '0')}`;
        const rule = { id, ...data, enabled: true, updatedAt: new Date().toISOString() };
        const records = ref.current.institutes.map((inst) => ({
          id: `CR-${inst.id.split('-')[1]}-${id.split('-')[1]}`, instituteId: inst.id, ruleId: id, category: rule.category,
          requirement: rule.name, description: rule.description, status: 'Evidence Pending', academicYear: '2026-27',
          lastUpdated: new Date().toISOString(), evidence: null, nextAction: nextActionFor('Evidence Pending'), note: '',
        }));
        commit({
          rules: [rule, ...ref.current.rules],
          compliance: [...ref.current.compliance, ...records],
          audit: withAudit(audit('Demo Rule Updated', 'Rule', id, `Added demo rule "${rule.name}".`)),
        });
        return rule;
      },
      updateRule(id, data) {
        commit({
          rules: ref.current.rules.map((r) => (r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r)),
          audit: withAudit(audit('Demo Rule Updated', 'Rule', id, `Edited demo rule "${data.name || id}".`)),
        });
      },
      toggleRule(id) {
        const rule = ref.current.rules.find((r) => r.id === id);
        if (!rule) return;
        commit({
          rules: ref.current.rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled, updatedAt: new Date().toISOString() } : r)),
          audit: withAudit(audit('Demo Rule Updated', 'Rule', id, `${rule.enabled ? 'Disabled' : 'Enabled'} demo rule "${rule.name}".`)),
        });
      },

      /* ---------- Admin: workflow ---------- */
      updateWorkflow(patch, note = 'Updated workflow configuration (demo).') {
        commit({
          workflow: { ...ref.current.workflow, ...patch },
          audit: withAudit(audit('Workflow Updated', 'Workflow', 'default', note)),
        });
      },

      /* ---------- Admin: alerts & reminders ---------- */
      addAlert(data) {
        const alert = { id: genId('ALR'), deliveryStatus: 'Draft', ...data, applicationId: data.applicationId || '' };
        commit({
          alerts: [alert, ...ref.current.alerts],
          audit: withAudit(audit('Alert Created', 'Alert', alert.id, `Created alert "${alert.title}".`)),
        });
        return alert;
      },
      updateAlert(id, data) {
        commit({ alerts: ref.current.alerts.map((a) => (a.id === id ? { ...a, ...data } : a)) });
      },
      deleteAlert(id) {
        commit({
          alerts: ref.current.alerts.filter((a) => a.id !== id),
          audit: withAudit(audit('Alert Created', 'Alert', id, 'Deleted a demo alert.')),
        });
      },
      sendAlert(id) {
        const alert = ref.current.alerts.find((a) => a.id === id);
        if (!alert) return false;
        const app = alert.applicationId ? getApp(alert.applicationId) : null;
        commit({
          alerts: ref.current.alerts.map((a) => (a.id === id ? { ...a, deliveryStatus: 'Sent in-app (simulated)' } : a)),
          notifications: withNotes(
            createNotification({
              title: alert.title,
              message: `${alert.category}${alert.applicationId ? ` for ${alert.applicationId}` : ''}. Delivered as an in-app demo notification.`,
              category: alert.category === 'Application Deadline' || alert.category === 'Pending Review' ? 'Deadline Reminder' : alert.category === 'Compliance Issue' ? 'Compliance' : alert.category === 'Missing Documents' ? 'Document Deficiency' : 'Application Update',
              relatedEntityId: alert.applicationId || null, audience: alert.recipientRole, instituteId: app?.instituteId || null,
            }),
          ),
          audit: withAudit(audit('Alert Sent (Simulated)', 'Alert', id, `Simulated in-app delivery to ${alert.recipientRole}. No email or SMS was sent.`)),
        });
        return true;
      },
      addDeadline(data) {
        const item = { id: genId('DL'), applicationId: null, instituteId: null, audience: data.recipientRole, reminderStatus: 'Active', completed: false, type: 'manual', ...data };
        commit({
          deadlines: [item, ...ref.current.deadlines],
          audit: withAudit(audit('Reminder Updated', 'Reminder', item.id, `Created demo reminder "${item.title}".`)),
        });
        return item;
      },
      updateDeadline(id, patch) {
        commit({
          deadlines: ref.current.deadlines.map((d) => (d.id === id ? { ...d, ...patch } : d)),
          audit: withAudit(audit('Reminder Updated', 'Reminder', id, 'Updated demo reminder settings.')),
        });
      },
      completeDeadline(id) {
        commit({
          deadlines: ref.current.deadlines.map((d) => (d.id === id ? { ...d, completed: true } : d)),
          audit: withAudit(audit('Reminder Updated', 'Reminder', id, 'Marked a demo reminder as done.')),
        });
      },
      deleteDeadline(id) {
        commit({
          deadlines: ref.current.deadlines.filter((d) => d.id !== id),
          audit: withAudit(audit('Reminder Updated', 'Reminder', id, 'Deleted a demo reminder.')),
        });
      },

      /* ---------- Reset ---------- */
      resetDemoData() {
        SLICES.forEach((key) => remove(key));
        const seed = buildSeed();
        ref.current = seed;
        dispatch({ type: 'REPLACE', state: seed });
      },
    };
  }, []);

  const value = useMemo(() => ({ ...state, actions }), [state, actions]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

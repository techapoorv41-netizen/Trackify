import {
  BarChart3, Bell, BellRing, Building2, CalendarClock, ClipboardCheck, ClipboardList, FilePlus2, FileText, FolderOpen,
  LayoutDashboard, Scale, ScrollText, Settings, ShieldCheck, Users, Workflow,
} from 'lucide-react';

export const NAV = {
  institute: [
    {
      section: 'Workspace',
      items: [
        { to: '/institute/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/institute/applications', label: 'My Applications', icon: FileText, match: (p) => p.startsWith('/institute/applications') && !p.endsWith('/new') },
        { to: '/institute/applications/new', label: 'New Application', icon: FilePlus2 },
        { to: '/institute/documents', label: 'Documents', icon: FolderOpen },
        { to: '/institute/compliance', label: 'Compliance', icon: ShieldCheck },
      ],
    },
    {
      section: 'Insights',
      items: [
        { to: '/reports', label: 'Reports', icon: BarChart3 },
        { to: '/notifications', label: 'Notifications', icon: Bell, badge: true },
      ],
    },
  ],
  officer: [
    {
      section: 'Scrutiny',
      items: [
        { to: '/officer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/officer/applications', label: 'Review Queue', icon: ClipboardList },
        { to: '/officer/compliance', label: 'Compliance Monitoring', icon: ShieldCheck },
      ],
    },
    {
      section: 'Insights',
      items: [
        { to: '/reports', label: 'Reports', icon: BarChart3 },
        { to: '/notifications', label: 'Notifications', icon: Bell, badge: true },
      ],
    },
  ],
  admin: [
    {
      section: 'Overview',
      items: [
        { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/officer/applications', label: 'Applications', icon: ClipboardCheck, match: (p) => p.startsWith('/officer/applications') },
        { to: '/reports', label: 'Reports', icon: BarChart3 },
      ],
    },
    {
      section: 'Administration',
      items: [
        { to: '/admin/users', label: 'Users', icon: Users },
        { to: '/admin/institutes', label: 'Institutes', icon: Building2 },
        { to: '/admin/workflows', label: 'Workflows', icon: Workflow },
        { to: '/admin/rules', label: 'Compliance Rules', icon: Scale },
        { to: '/admin/alerts', label: 'Alerts', icon: BellRing },
        { to: '/admin/reminders', label: 'Deadline Reminders', icon: CalendarClock },
        { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
      ],
    },
    {
      section: 'Account',
      items: [{ to: '/notifications', label: 'Notifications', icon: Bell, badge: true }],
    },
  ],
};

export const SETTINGS_ITEM = { to: '/settings', label: 'Settings', icon: Settings };

export const CRUMB_LABELS = {
  dashboard: 'Dashboard',
  applications: 'Applications',
  new: 'New Application',
  documents: 'Documents',
  compliance: 'Compliance',
  users: 'Users',
  institutes: 'Institutes',
  workflows: 'Workflows',
  rules: 'Compliance Rules',
  alerts: 'Alerts',
  reminders: 'Deadline Reminders',
  'audit-logs': 'Audit Logs',
  reports: 'Reports',
  notifications: 'Notifications',
  profile: 'Profile',
  settings: 'Settings',
};

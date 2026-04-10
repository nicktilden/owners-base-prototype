import React, { useMemo, useState } from 'react';
import { Box, Button, Card, Checkbox, Form, Page, Select, Switch, Table, Tabs, Tearsheet, Typography } from '@procore/core-react';
import styled, { createGlobalStyle } from 'styled-components';
import { useData } from '@/context/DataContext';
import { usePersona } from '@/context/PersonaContext';
import { useTheme } from '@/context/ThemeContext';
import type { PermissionKey, ToolPermissionLevel } from '@/types/permissions';
import type { ToolKey } from '@/types/tools';
import type { UserRole } from '@/types/user';

interface ProfileSettingsTearsheetProps {
  open: boolean;
  onClose: () => void;
}

const PROFILE_TABS = ['Personal', 'My Connected Apps', 'Favorites', 'Notifications', 'Password & Security'] as const;
type ProfileTab = (typeof PROFILE_TABS)[number];

interface OptionValue { id: string; label: string }
interface ProfileFormValues {
  firstName: string; lastName: string; email: string; companyName: string; jobTitle: string; role: string;
  avatar: string; accountId: string; projectIds: OptionValue[]; favoriteProjectIds: OptionValue[];
  favoriteToolKeys: OptionValue[]; toolDenied: OptionValue[]; keyDefaults: OptionValue[]; keyGranted: OptionValue[];
  keyDenied: OptionValue[]; toolDefaultsJson: string; toolGrantedJson: string; createdAt: string; updatedAt: string;
  lastActiveAt: string; timeZone: string; officeName: string; officeAddress: string; officeCity: string;
  officeState: string; officeZip: string; officeCountry: string;
}

const USER_ROLES: UserRole[] = ['Executive Strategy', 'Operations & Administration', 'Project Delivery', 'Field Opperations'];
const FORM_CARD_STYLE: React.CSSProperties = { padding: 16, background: 'var(--color-surface-primary)', color: 'var(--color-text-primary)' };
const TearsheetAnimationOverride = createGlobalStyle`
  [class*="sc-ljrxoq-0"] {
    animation-duration: 200ms !important;
  }
  [class*="sc-ljrxoq-4"] {
    animation: none !important;
    transition: none !important;
  }
  [class*="sc-1ijdug2-0"] {
    transition-duration: 75ms !important;
  }

  html[data-color-scheme="dark"] [class*="sc-1ijdug2-0"] {
    background: transparent !important;
  }

  html[data-color-scheme="dark"] [aria-label="My profile settings"] {
    h1, h2, h3, h4, p, span, label {
      color: var(--color-text-primary) !important;
    }
    button[class][aria-haspopup="listbox"],
    button[class][aria-haspopup="listbox"] span {
      color: var(--color-text-primary) !important;
    }
  }
`;

type ThemeOption = 'system' | 'default-light' | 'default-dark' | 'owner-light' | 'owner-dark';

const THEME_OPTIONS: { value: ThemeOption; label: string }[] = [
  { value: 'system', label: 'System Preference' },
  { value: 'default-light', label: 'Default Light' },
  { value: 'default-dark', label: 'Default Dark' },
  { value: 'owner-light', label: 'Owners Light' },
  { value: 'owner-dark', label: 'Owners Dark' },
];

function toIso(value: Date | null): string { return value ? value.toISOString() : ''; }
function safeParseRecord<T extends Record<string, unknown>>(value: string, fallback: T): T {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as T;
  } catch {}
  return fallback;
}
function parseDateOrFallback(value: string, fallback: Date | null): Date | null {
  if (!value.trim()) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

export default function ProfileSettingsTearsheet({ open, onClose }: ProfileSettingsTearsheetProps) {
  const [selectedTab, setSelectedTab] = useState<ProfileTab>('Personal');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [rememberDevices, setRememberDevices] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState('30');
  const { activeUser, setActiveUser, users, setUsers } = usePersona();
  const { data, setData } = useData();
  const { theme, colorScheme, resolvedColorScheme, setTheme, setColorScheme } = useTheme();
  const isDark = resolvedColorScheme === 'dark';

  const projectOptions = useMemo(
    () => data.projects.map((project) => ({ id: project.id, label: `${project.number} - ${project.name}` })),
    [data.projects]
  );
  const toolOptions = useMemo(
    () => Object.entries({
      hubs: 'Home', documents: 'Documents', schedule: 'Schedule', assets: 'Assets', budget: 'Budget', tasks: 'Tasks',
      capital_planning: 'Capital Planning', funding_source: 'Funding Source', bidding: 'Bidding', action_plans: 'Action Plans',
      change_events: 'Change Events', change_orders: 'Change Orders', invoicing: 'Invoicing', prime_contracts: 'Prime Contracts',
      rfis: 'RFIs', punch_list: 'Punch List', specifications: 'Specifications', submittals: 'Submittals',
      observations: 'Observations', correspondence: 'Correspondence', commitments: 'Commitments',
    } as const).map(([id, label]) => ({ id, label })),
    []
  );
  const permissionKeyOptions = useMemo(
    () => [
      'platform:access', 'account:read', 'account:update', 'account:manage_billing', 'users:invite', 'users:remove',
      'users:update_role', 'users:update_permissions', 'projects:create', 'projects:read', 'projects:update',
      'projects:delete', 'projects:manage_members', 'tools:enable', 'tools:disable',
    ].map((id) => ({ id, label: id })),
    []
  );

  const initialValues = useMemo<ProfileFormValues>(() => {
    if (!activeUser) {
      return {
        firstName: '', lastName: '', email: '', companyName: '', jobTitle: '', role: '', avatar: '', accountId: '',
        projectIds: [], favoriteProjectIds: [], favoriteToolKeys: [], toolDenied: [], keyDefaults: [], keyGranted: [],
        keyDenied: [], toolDefaultsJson: '{}', toolGrantedJson: '{}', createdAt: '', updatedAt: '', lastActiveAt: '',
        timeZone: data.account?.timeZone ?? '', officeName: data.account?.office.name ?? '', officeAddress: data.account?.office.address ?? '',
        officeCity: data.account?.office.city ?? '', officeState: data.account?.office.state ?? '', officeZip: data.account?.office.zip ?? '',
        officeCountry: data.account?.office.country ?? '',
      };
    }
    return {
      firstName: activeUser.firstName, lastName: activeUser.lastName, email: activeUser.email, companyName: activeUser.companyName,
      jobTitle: activeUser.jobTitle, role: activeUser.role, avatar: activeUser.avatar ?? '', accountId: activeUser.accountId,
      projectIds: activeUser.projectIds.map((id) => {
        const project = data.projects.find((p) => p.id === id);
        return { id, label: project ? `${project.number} - ${project.name}` : id };
      }),
      favoriteProjectIds: activeUser.favorites.projectIds.map((id) => {
        const project = data.projects.find((p) => p.id === id);
        return { id, label: project ? `${project.number} - ${project.name}` : id };
      }),
      favoriteToolKeys: activeUser.favorites.toolKeys.map((key) => ({ id: key, label: toolOptions.find((o) => o.id === key)?.label ?? key })),
      toolDenied: activeUser.permissions.toolDenied.map((key) => ({ id: key, label: toolOptions.find((o) => o.id === key)?.label ?? key })),
      keyDefaults: activeUser.permissions.keyDefaults.map((key) => ({ id: key, label: key })),
      keyGranted: activeUser.permissions.keyGranted.map((key) => ({ id: key, label: key })),
      keyDenied: activeUser.permissions.keyDenied.map((key) => ({ id: key, label: key })),
      toolDefaultsJson: JSON.stringify(activeUser.permissions.toolDefaults, null, 2),
      toolGrantedJson: JSON.stringify(activeUser.permissions.toolGranted, null, 2),
      createdAt: toIso(activeUser.createdAt), updatedAt: toIso(activeUser.updatedAt), lastActiveAt: toIso(activeUser.lastActiveAt),
      timeZone: data.account?.timeZone ?? '', officeName: data.account?.office.name ?? '', officeAddress: data.account?.office.address ?? '',
      officeCity: data.account?.office.city ?? '', officeState: data.account?.office.state ?? '', officeZip: data.account?.office.zip ?? '',
      officeCountry: data.account?.office.country ?? '',
    };
  }, [activeUser, data.account, data.projects, toolOptions]);

  function handleProfileSave(values: ProfileFormValues) {
    if (!activeUser) return;
    const nextRole = USER_ROLES.includes(values.role as UserRole) ? (values.role as UserRole) : activeUser.role;
    const updatedUser = {
      ...activeUser,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      companyName: values.companyName.trim(),
      jobTitle: values.jobTitle.trim(),
      role: nextRole,
      avatar: values.avatar.trim() || null,
      accountId: values.accountId.trim(),
      projectIds: values.projectIds.map((p) => p.id),
      favorites: { projectIds: values.favoriteProjectIds.map((p) => p.id), toolKeys: values.favoriteToolKeys.map((t) => t.id as ToolKey) },
      permissions: {
        ...activeUser.permissions,
        toolDefaults: safeParseRecord(values.toolDefaultsJson, activeUser.permissions.toolDefaults as Record<string, unknown>) as Record<ToolKey, ToolPermissionLevel>,
        toolGranted: safeParseRecord(values.toolGrantedJson, activeUser.permissions.toolGranted as Record<string, unknown>) as Record<ToolKey, ToolPermissionLevel>,
        toolDenied: values.toolDenied.map((t) => t.id as ToolKey),
        keyDefaults: values.keyDefaults.map((k) => k.id as PermissionKey),
        keyGranted: values.keyGranted.map((k) => k.id as PermissionKey),
        keyDenied: values.keyDenied.map((k) => k.id as PermissionKey),
      },
      createdAt: parseDateOrFallback(values.createdAt, activeUser.createdAt) ?? activeUser.createdAt,
      updatedAt: parseDateOrFallback(values.updatedAt, activeUser.updatedAt) ?? activeUser.updatedAt,
      lastActiveAt: parseDateOrFallback(values.lastActiveAt, activeUser.lastActiveAt),
    };
    const nextUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(nextUsers);
    setActiveUser(updatedUser);
    setData(
      data.account
        ? {
            ...data,
            users: nextUsers,
            account: {
              ...data.account,
              timeZone: values.timeZone.trim(),
              office: {
                name: values.officeName.trim(),
                address: values.officeAddress.trim(),
                city: values.officeCity.trim(),
                state: values.officeState.trim() as typeof data.account.office.state,
                zip: values.officeZip.trim(),
                country: values.officeCountry.trim(),
              },
            },
          }
        : { ...data, users: nextUsers }
    );
  }

  function updateFavoriteSelections(nextProjectIds: string[], nextToolIds: string[]) {
    if (!activeUser) return;

    const updatedUser = {
      ...activeUser,
      favorites: {
        projectIds: nextProjectIds,
        toolKeys: nextToolIds as ToolKey[],
      },
    };

    const nextUsers = users.map((user) => (user.id === updatedUser.id ? updatedUser : user));
    setUsers(nextUsers);
    setActiveUser(updatedUser);
    setData({ ...data, users: nextUsers });
  }

  function renderConnectedAppsTab() {
    return (
      <Card>
        <Form initialValues={{ connectedWorkspace: 'Owners Enterprise Workspace', documentStorage: 'SharePoint' }} onSubmit={() => undefined}>
          <Form.Form style={FORM_CARD_STYLE}>
            <Typography intent="h2" style={{ marginBottom: 8 }}>My Connected Apps</Typography>
            <Form.Row>
              <Form.Text name="connectedWorkspace" label="Connected Workspace" colStart={1} colWidth={6} />
              <Form.Select
                name="documentStorage"
                label="Document Storage"
                colStart={7}
                colWidth={6}
                options={[{ id: 'SharePoint', label: 'SharePoint' }, { id: 'Google Drive', label: 'Google Drive' }, { id: 'Dropbox', label: 'Dropbox' }]}
              />
            </Form.Row>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Switch aria-label="Enable Procore Drive integration" defaultChecked />
              <Typography intent="body">Procore Drive integration enabled</Typography>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Switch aria-label="Enable accounting sync integration" />
              <Typography intent="body">Accounting sync integration disabled</Typography>
            </Box>
            <Form.SettingsPageFooter style={{ marginTop: 24 }}>
<Button variant="secondary" className="b_secondary" data-variant="secondary" onClick={onClose}>Cancel</Button>
                          <Button variant="primary" className="b_primary" type="submit">Save Connected Apps</Button>
            </Form.SettingsPageFooter>
          </Form.Form>
        </Form>
      </Card>
    );
  }

  function renderFavoritesTab() {
    return (
      <>
        <Card style={{ marginBottom: 16 }}>
          <Box style={FORM_CARD_STYLE}>
            <Typography intent="h2" style={{ marginBottom: 8 }}>Favorite Projects</Typography>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {projectOptions.map((project) => {
                const checked = Boolean(activeUser?.favorites.projectIds.includes(project.id));
                return (
                  <Checkbox
                    key={project.id}
                    checked={checked}
                    onChange={(event) => {
                      const currentlySelected = activeUser?.favorites.projectIds ?? [];
                      const nextProjectIds = event.currentTarget.checked
                        ? [...currentlySelected, project.id]
                        : currentlySelected.filter((id) => id !== project.id);
                      updateFavoriteSelections(nextProjectIds, activeUser?.favorites.toolKeys ?? []);
                    }}
                  >
                    {project.label}
                  </Checkbox>
                );
              })}
            </Box>
          </Box>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Box style={FORM_CARD_STYLE}>
            <Typography intent="h2" style={{ marginBottom: 8 }}>Favorite Tools</Typography>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {toolOptions.map((tool) => {
                const checked = Boolean(activeUser?.favorites.toolKeys.includes(tool.id as ToolKey));
                return (
                  <Checkbox
                    key={tool.id}
                    checked={checked}
                    onChange={(event) => {
                      const currentlySelected = activeUser?.favorites.toolKeys ?? [];
                      const nextToolIds = event.currentTarget.checked
                        ? [...currentlySelected, tool.id as ToolKey]
                        : currentlySelected.filter((id) => id !== tool.id);
                      updateFavoriteSelections(activeUser?.favorites.projectIds ?? [], nextToolIds);
                    }}
                  >
                    {tool.label}
                  </Checkbox>
                );
              })}
            </Box>
          </Box>
        </Card>

        <Card>
          <Form initialValues={{ favoriteLandingPage: 'Portfolio Home' }} onSubmit={() => undefined}>
            <Form.Form style={FORM_CARD_STYLE}>
              <Typography intent="h2" style={{ marginBottom: 8 }}>Defaults</Typography>
              <Form.Row>
                <Form.Select
                  name="favoriteLandingPage"
                  label="Default Landing Page"
                  colStart={1}
                  colWidth={12}
                  options={[
                    { id: 'Portfolio Home', label: 'Portfolio Home' },
                    { id: 'Personal Dashboard', label: 'Personal Dashboard' },
                    { id: 'Home', label: 'Home' },
                    { id: 'Documents', label: 'Documents' },
                    { id: 'Schedule', label: 'Schedule' },
                  ]}
                />
              </Form.Row>
              <Form.SettingsPageFooter style={{ marginTop: 24 }}>
<Button variant="secondary" className="b_secondary" data-variant="secondary" onClick={onClose}>Cancel</Button>
              <Button variant="primary" className="b_primary" type="submit">Save Favorites</Button>
              </Form.SettingsPageFooter>
            </Form.Form>
          </Form>
        </Card>
      </>
    );
  }

  function renderNotificationsTab() {
    return (
      <Card>
        <Form initialValues={{ emailFrequency: 'Immediate', digestTime: '08:00 AM' }} onSubmit={() => undefined}>
          <Form.Form style={FORM_CARD_STYLE}>
            <Typography intent="h2" style={{ marginBottom: 8 }}>Notifications</Typography>
            <Form.Row>
              <Form.Select
                name="emailFrequency"
                label="Email Frequency"
                colStart={1}
                colWidth={6}
                options={[{ id: 'Immediate', label: 'Immediate' }, { id: 'Hourly', label: 'Hourly Digest' }, { id: 'Daily', label: 'Daily Digest' }]}
              />
              <Form.Text name="digestTime" label="Daily Digest Time" colStart={7} colWidth={6} />
            </Form.Row>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Switch aria-label="Enable browser notifications" defaultChecked /><Typography intent="body">Browser notifications</Typography></Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Switch aria-label="Enable mobile push notifications" /><Typography intent="body">Mobile push notifications</Typography></Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Switch aria-label="Enable budget alerts" defaultChecked /><Typography intent="body">Budget alerts</Typography></Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Switch aria-label="Enable schedule alerts" defaultChecked /><Typography intent="body">Schedule alerts</Typography></Box>
            <Form.SettingsPageFooter style={{ marginTop: 24 }}>
              <Button variant="secondary" className="b_secondary" data-variant="secondary" onClick={onClose}>Cancel</Button>
              <Button variant="primary" className="b_primary" type="submit">Save Notifications</Button>
            </Form.SettingsPageFooter>
          </Form.Form>
        </Form>
      </Card>
    );
  }

  function renderPasswordAndSecurityTab() {
    return (
      <Card>
        <Form
          initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '', twoFactorMethod: 'Authenticator App', recoveryEmail: activeUser?.email ?? '', timeoutMinutes: sessionTimeoutMins }}
          onSubmit={() => undefined}
          enableReinitialize
        >
          <Form.Form style={FORM_CARD_STYLE}>
            <Typography intent="h2" style={{ marginBottom: 8 }}>Password & Security</Typography>
            <Typography intent="h3">Password</Typography>
            <Form.Row>
              <Form.Text name="currentPassword" label="Current Password" colStart={1} colWidth={6} type="password" required />
              <Form.Text name="newPassword" label="New Password" colStart={7} colWidth={6} type="password" required />
            </Form.Row>
            <Form.Row>
              <Form.Text name="confirmPassword" label="Confirm New Password" colStart={1} colWidth={6} type="password" required />
            </Form.Row>
            <Typography intent="h3">Two-Factor Authentication</Typography>
            <Form.Row>
              <Form.Text name="twoFactorMethod" label="2FA Method" colStart={1} colWidth={6} disabled={!twoFactorEnabled} />
              <Form.Text name="recoveryEmail" label="Recovery Email" colStart={7} colWidth={6} disabled={!twoFactorEnabled} />
            </Form.Row>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Switch aria-label="Enable two-factor authentication" checked={twoFactorEnabled} onChange={(event) => setTwoFactorEnabled(event.currentTarget.checked)} />
              <Typography intent="body">{twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}</Typography>
            </Box>
            <Typography intent="h3">Session & Device Security</Typography>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Switch aria-label="Remember trusted devices" checked={rememberDevices} onChange={(event) => setRememberDevices(event.currentTarget.checked)} />
              <Typography intent="body">Remember trusted devices for 30 days</Typography>
            </Box>
            <Form.Row>
              <Form.Text name="timeoutMinutes" label="Auto sign-out timeout (minutes)" colStart={1} colWidth={6} onChange={(event) => setSessionTimeoutMins(event.currentTarget.value)} />
            </Form.Row>
            <Typography intent="h3">Active Sessions</Typography>
            <Table.Container>
              <Table>
                <Table.Header><Table.HeaderRow><Table.HeaderCell>Device</Table.HeaderCell><Table.HeaderCell>Location</Table.HeaderCell><Table.HeaderCell>Last Active</Table.HeaderCell><Table.HeaderCell>Action</Table.HeaderCell></Table.HeaderRow></Table.Header>
                <Table.Body>
                  <Table.BodyRow>
                    <Table.BodyCell><Table.TextCell>MacBook Pro (Current)</Table.TextCell></Table.BodyCell>
                    <Table.BodyCell><Table.TextCell>Austin, TX</Table.TextCell></Table.BodyCell>
                    <Table.BodyCell><Table.TextCell>Now</Table.TextCell></Table.BodyCell>
                    <Table.BodyCell><Button className="b_tertiary" variant="tertiary" size="sm" disabled>Current Session</Button></Table.BodyCell>
                  </Table.BodyRow>
                  <Table.BodyRow>
                    <Table.BodyCell><Table.TextCell>iPhone 15</Table.TextCell></Table.BodyCell>
                    <Table.BodyCell><Table.TextCell>Dallas, TX</Table.TextCell></Table.BodyCell>
                    <Table.BodyCell><Table.TextCell>2 hours ago</Table.TextCell></Table.BodyCell>
                    <Table.BodyCell><Button variant="secondary" className="b_secondary" data-variant="secondary" size="sm">Revoke</Button></Table.BodyCell>
                  </Table.BodyRow>
                </Table.Body>
              </Table>
            </Table.Container>
            <Typography intent="h3">Security Alerts</Typography>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Switch aria-label="Enable security alerts" checked={securityAlerts} onChange={(event) => setSecurityAlerts(event.currentTarget.checked)} />
              <Typography intent="body">Email me when suspicious activity is detected</Typography>
            </Box>
            <Form.SettingsPageFooter style={{ marginTop: 24 }}>
              <Button variant="secondary" className="b_secondary" data-variant="secondary" onClick={onClose}>Cancel</Button>
              <Button variant="primary" className="b_primary" type="submit">Save Security Settings</Button>
            </Form.SettingsPageFooter>
          </Form.Form>
        </Form>
      </Card>
    );
  }

  return (
    <>
      <TearsheetAnimationOverride />
      <Tearsheet open={open} onClose={onClose} aria-label="My profile settings" placement="right" block>
        <Page style={{ height: '100%', background: 'var(--color-surface-primary)', color: 'var(--color-text-primary)' }}>
          <Page.Main style={{ height: '100%', overflow: 'hidden', background: 'var(--color-surface-primary)' }}>
            <Page.Header style={{ background: 'var(--color-surface-primary)', borderColor: 'var(--color-border-separator)' }}>
              <Page.Title><Typography intent="h2">My Profile Settings</Typography></Page.Title>
              <Page.Tabs>
                <Tabs>
                  {PROFILE_TABS.map((tab) => {
                    const isSelected = selectedTab === tab;
                    return (
                      <Tabs.Tab
                        key={tab}
                        role="button"
                        selected={isSelected}
                        onPress={() => setSelectedTab(tab)}
                        style={isDark ? { color: isSelected ? 'var(--color-text-link)' : 'var(--color-text-primary)' } : undefined}
                      >
                        {tab}
                      </Tabs.Tab>
                    );
                  })}
                </Tabs>
              </Page.Tabs>
            </Page.Header>
            <Page.Body style={{ padding: 24, overflowY: 'auto', background: 'var(--color-surface-secondary)' }}>
              {selectedTab === 'Personal' && (
                <>
                  <Card>
                    <Box style={FORM_CARD_STYLE}>
                      <Typography intent="h2" style={{ marginBottom: 4 }}>Appearance</Typography>
                      <Typography intent="body" style={{ color: 'var(--color-text-secondary)', marginBottom: 16, display: 'block' }}>
                        Choose a brand theme and color scheme for the interface.
                      </Typography>

                      <Typography intent="h3" style={{ marginBottom: 8 }}>Interface Theme</Typography>
                      <Box style={{ width: '50%' }}>
                        <Select
                        className="i_select"
                          label={THEME_OPTIONS.find((o) => o.value === (
                            colorScheme === 'system' ? 'system'
                              : `${theme === 'default' ? 'default' : 'owner'}-${colorScheme}` as ThemeOption
                          ))?.label}
                          onSelect={(selection) => {
                            const val = selection.item as ThemeOption;
                            if (val === 'system') {
                              setColorScheme('system');
                            } else {
                              const [t, s] = val.split('-') as ['default' | 'owner', 'light' | 'dark'];
                              setTheme(t);
                              setColorScheme(s);
                            }
                          }}
                          block
                        >
                          {THEME_OPTIONS.map((opt) => (
                            <Select.Option
                              key={opt.value}
                              value={opt.value}
                              selected={
                                colorScheme === 'system'
                                  ? opt.value === 'system'
                                  : opt.value === `${theme === 'default' ? 'default' : 'owner'}-${colorScheme}`
                              }
                            >
                              {opt.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Box>
                    </Box>
                  </Card>

                  <Card style={{ marginTop: 16 }}>
                    <Form initialValues={initialValues} onSubmit={handleProfileSave} enableReinitialize>
                      <Form.Form style={FORM_CARD_STYLE}>
                        <Typography intent="h2" style={{ marginBottom: 8 }}>Personal Info</Typography>
                        <Form.Row>
                          <Form.Text name="firstName" label="First Name" colStart={1} colWidth={6} required />
                          <Form.Text name="lastName" label="Last Name" colStart={7} colWidth={6} required />
                        </Form.Row>
                        <Form.Row>
                          <Form.Text name="email" label="Email Address" colStart={1} colWidth={6} required />
                          <Form.Text name="jobTitle" label="Job Title" colStart={7} colWidth={6} />
                        </Form.Row>
                        <Form.Row>
                          <Form.Select
                            name="role"
                            label="Role"
                            colStart={1}
                            colWidth={6}
                            disabled
                            options={USER_ROLES.map((role) => ({ id: role, label: role }))}
                          />
                          <Form.Text name="companyName" label="Company Name" colStart={7} colWidth={6} />
                        </Form.Row>
                        <Form.Row>
                          <Form.Text name="avatar" label="Avatar URL" colStart={1} colWidth={6} />
                          <Form.Text name="accountId" label="Account ID" colStart={7} colWidth={6} disabled />
                        </Form.Row>
                        <Form.Row>
                          <Form.Text name="timeZone" label="Time Zone" colStart={1} colWidth={6} />
                          <Form.Text name="officeName" label="Office Name" colStart={7} colWidth={6} />
                        </Form.Row>
                        <Form.Row>
                          <Form.Text name="officeAddress" label="Office Address" colStart={1} colWidth={6} />
                          <Form.Text name="officeCity" label="Office City" colStart={7} colWidth={6} />
                        </Form.Row>
                        <Form.Row>
                          <Form.Text name="officeState" label="Office State" colStart={1} colWidth={6} />
                          <Form.Text name="officeZip" label="Office ZIP" colStart={7} colWidth={6} />
                        </Form.Row>
                        <Form.Row>
                          <Form.Text name="officeCountry" label="Office Country" colStart={1} colWidth={6} />
                        </Form.Row>
                        <Form.SettingsPageFooter style={{ marginTop: 24 }}>
                          <Button variant="secondary" className="b_secondary" data-variant="secondary" onClick={onClose}>Cancel</Button>
                          <Button variant="primary" className="b_primary" type="submit">Save Profile</Button>
                        </Form.SettingsPageFooter>
                      </Form.Form>
                    </Form>
                  </Card>
                </>
              )}
              {selectedTab === 'My Connected Apps' && renderConnectedAppsTab()}
              {selectedTab === 'Favorites' && renderFavoritesTab()}
              {selectedTab === 'Notifications' && renderNotificationsTab()}
              {selectedTab === 'Password & Security' && renderPasswordAndSecurityTab()}
            </Page.Body>
          </Page.Main>
        </Page>
      </Tearsheet>
    </>
  );
}

import React, { useMemo, useState } from 'react';
import { Box, Button, Card, Checkbox, Form, H2, Page, Switch, Table, Tabs, Tearsheet, Typography } from '@procore/core-react';
import { createGlobalStyle } from 'styled-components';
import { useData } from '@/context/DataContext';
import { usePersona } from '@/context/PersonaContext';
import type { PermissionKey, ToolPermissionLevel } from '@/types/permissions';
import type { ToolKey } from '@/types/tools';
import type { UserRole } from '@/types/user';

const ProfileTearsheetWidth = createGlobalStyle`
  /* Scope to this tearsheet only — unscoped rules steal width from every Tearsheet (e.g. HLBI). */
  [class*="StyledTearsheetBody"]:has(> .profile-settings-tearsheet-root) {
    flex: 0 0 50vw !important;
  }
`;

interface ProfileSettingsTearsheetProps {
  open: boolean;
  onClose: () => void;
}

const PROFILE_TABS = ['Personal', 'Preferences', 'Favorites', 'Notifications', 'Password & Security', 'Connected Apps'] as const;
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
const FORM_CARD_STYLE = { padding: 16 };

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
  const [textDirectionControls, setTextDirectionControls] = useState(false);
  const [startWeekOnMonday, setStartWeekOnMonday] = useState(false);
  const [autoTimeZone, setAutoTimeZone] = useState(true);
  const [showViewHistory, setShowViewHistory] = useState(true);
  const [profileDiscoverability, setProfileDiscoverability] = useState(true);
  const { activeUser, setActiveUser, users, setUsers } = usePersona();
  const { data, setData } = useData();

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

  function renderPreferencesTab() {
    return (
      <>
      <Card>
        <Form
          initialValues={{ language: 'English (US)', numberFormat: 'Default', dateFormat: 'Relative', prefsTimeZone: '(GMT-5:00) Chicago' }}
          onSubmit={() => undefined}
        >
          <Form.Form style={FORM_CARD_STYLE}>
            <H2 style={{ marginBottom: 16 }}>Language & time</H2>

            <Form.Row>
              <Form.Select
                name="language"
                label="Language"
                colStart={1}
                colWidth={8}
                options={[
                  { id: 'English (US)', label: 'English (US)' },
                  { id: 'English (UK)', label: 'English (UK)' },
                  { id: 'Español', label: 'Español' },
                  { id: 'Français', label: 'Français' },
                  { id: 'Deutsch', label: 'Deutsch' },
                  { id: 'Português', label: 'Português' },
                  { id: '日本語', label: '日本語' },
                ]}
              />
            </Form.Row>
            <Typography intent="small" color="gray45" style={{ marginTop: -8, marginBottom: 16 }}>Choose the language you want to use Procore in</Typography>

            <Form.Row>
              <Form.Select
                name="numberFormat"
                label="Number format"
                colStart={1}
                colWidth={8}
                options={[
                  { id: 'Default', label: 'Default' },
                  { id: '1,234.56', label: '1,234.56' },
                  { id: '1.234,56', label: '1.234,56' },
                  { id: '1 234,56', label: '1 234,56' },
                ]}
              />
            </Form.Row>
            <Typography intent="small" color="gray45" style={{ marginTop: -8, marginBottom: 16 }}>Choose how numbers and currencies are formatted. Default uses your language setting.</Typography>

            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 8 }}>
              <Box>
                <Typography intent="body" style={{ fontWeight: 600 }}>Always show text direction controls</Typography>
                <Typography intent="small" color="gray45">Show the option to change text direction (left to right or right to left) in the editor, regardless of what language you&apos;re using</Typography>
              </Box>
              <Switch aria-label="Always show text direction controls" checked={textDirectionControls} onChange={(e) => setTextDirectionControls(e.currentTarget.checked)} />
            </Box>

            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 8, borderTop: '1px solid #e0e0e0' }}>
              <Box>
                <Typography intent="body" style={{ fontWeight: 600 }}>Start week on Monday</Typography>
                <Typography intent="small" color="gray45">This will affect the way your calendars appear in Procore</Typography>
              </Box>
              <Switch aria-label="Start week on Monday" checked={startWeekOnMonday} onChange={(e) => setStartWeekOnMonday(e.currentTarget.checked)} />
            </Box>

            <Box style={{ borderTop: '1px solid #e0e0e0', paddingTop: 8, paddingBottom: 8 }}>
              <Form.Row>
                <Form.Select
                  name="dateFormat"
                  label="Date format"
                  colStart={1}
                  colWidth={8}
                  options={[
                    { id: 'Relative', label: 'Relative' },
                    { id: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                    { id: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    { id: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                  ]}
                />
              </Form.Row>
              <Typography intent="small" color="gray45" style={{ marginTop: -8, marginBottom: 16 }}>Set the default format for new @date mentions</Typography>
            </Box>

            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 8, borderTop: '1px solid #e0e0e0' }}>
              <Box>
                <Typography intent="body" style={{ fontWeight: 600 }}>Set time zone automatically using your location</Typography>
                <Typography intent="small" color="gray45">Reminders, notifications, and emails will be delivered to you based on your time zone</Typography>
              </Box>
              <Switch aria-label="Set time zone automatically" checked={autoTimeZone} onChange={(e) => setAutoTimeZone(e.currentTarget.checked)} />
            </Box>

            <Box style={{ borderTop: '1px solid #e0e0e0', paddingTop: 8, paddingBottom: 8 }}>
              <Form.Row>
                <Form.Select
                  name="prefsTimeZone"
                  label="Time zone"
                  colStart={1}
                  colWidth={8}
                  options={[
                    { id: '(GMT-5:00) Chicago', label: '(GMT-5:00) Chicago' },
                    { id: '(GMT-8:00) Los Angeles', label: '(GMT-8:00) Los Angeles' },
                    { id: '(GMT-7:00) Denver', label: '(GMT-7:00) Denver' },
                    { id: '(GMT-6:00) Dallas', label: '(GMT-6:00) Dallas' },
                    { id: '(GMT-5:00) New York', label: '(GMT-5:00) New York' },
                    { id: '(GMT+0:00) London', label: '(GMT+0:00) London' },
                    { id: '(GMT+1:00) Berlin', label: '(GMT+1:00) Berlin' },
                    { id: '(GMT+9:00) Tokyo', label: '(GMT+9:00) Tokyo' },
                    { id: '(GMT+10:00) Sydney', label: '(GMT+10:00) Sydney' },
                  ]}
                />
              </Form.Row>
              <Typography intent="small" color="gray45" style={{ marginTop: -8 }}>Choose your time zone</Typography>
            </Box>

            <Form.SettingsPageFooter style={{ marginTop: 24 }}>
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button variant="primary" type="submit">Save Preferences</Button>
            </Form.SettingsPageFooter>
          </Form.Form>
        </Form>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Form initialValues={{ cookieSettings: 'Customize' }} onSubmit={() => undefined}>
          <Form.Form style={FORM_CARD_STYLE}>
            <H2 style={{ marginBottom: 16 }}>Privacy</H2>

            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 8 }}>
              <Box>
                <Typography intent="body" style={{ fontWeight: 600 }}>Cookie settings</Typography>
                <Typography intent="small" color="gray45">See the Cookie Notice for more information</Typography>
              </Box>
              <Form.Select
                name="cookieSettings"
                label=""
                colStart={1}
                colWidth={3}
                options={[
                  { id: 'Customize', label: 'Customize' },
                  { id: 'Accept All', label: 'Accept All' },
                  { id: 'Reject All', label: 'Reject All' },
                ]}
              />
            </Box>

            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 8, borderTop: '1px solid #e0e0e0' }}>
              <Box>
                <Typography intent="body" style={{ fontWeight: 600 }}>Show my view history</Typography>
                <Typography intent="small" color="gray45">People with edit or full access will be able to see when you&apos;ve viewed a page.</Typography>
              </Box>
              <Switch aria-label="Show my view history" checked={showViewHistory} onChange={(e) => setShowViewHistory(e.currentTarget.checked)} />
            </Box>

            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 8, borderTop: '1px solid #e0e0e0' }}>
              <Box>
                <Typography intent="body" style={{ fontWeight: 600 }}>Profile discoverability</Typography>
                <Typography intent="small" color="gray45">Users who know your email will see your Procore name and profile picture when inviting you to a new workspace.</Typography>
              </Box>
              <Switch aria-label="Profile discoverability" checked={profileDiscoverability} onChange={(e) => setProfileDiscoverability(e.currentTarget.checked)} />
            </Box>
          </Form.Form>
        </Form>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Form initialValues={{ favoriteLandingPage: 'Portfolio Home' }} onSubmit={() => undefined}>
          <Form.Form style={FORM_CARD_STYLE}>
            <H2 style={{ marginBottom: 16 }}>Defaults</H2>
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
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button variant="primary" type="submit">Save Defaults</Button>
            </Form.SettingsPageFooter>
          </Form.Form>
        </Form>
      </Card>
      </>
    );
  }

  function renderConnectedAppsTab() {
    return (
      <Card>
        <Form initialValues={{ connectedWorkspace: 'Owners Enterprise Workspace', documentStorage: 'SharePoint' }} onSubmit={() => undefined}>
          <Form.Form style={FORM_CARD_STYLE}>
            <H2 style={{ marginBottom: 16 }}>My Connected Apps</H2>
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
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button variant="primary" type="submit">Save Connected Apps</Button>
            </Form.SettingsPageFooter>
          </Form.Form>
        </Form>
      </Card>
    );
  }

  function renderFavoritesTab() {
    return (
      <>
        <Card style={{ marginBottom: 16, padding: 16 }}>
          <H2 style={{ marginBottom: 16 }}>Favorite Projects</H2>
          <Table.Container>
            <Table>
              <Table.Header>
                <Table.HeaderRow>
                  <Table.HeaderCell style={{ width: 55, textAlign: 'center' }}>{' '}</Table.HeaderCell>
                  <Table.HeaderCell>Project</Table.HeaderCell>
                </Table.HeaderRow>
              </Table.Header>
              <Table.Body>
                {projectOptions.map((project) => {
                  const checked = Boolean(activeUser?.favorites.projectIds.includes(project.id));
                  return (
                    <Table.BodyRow key={project.id}>
                      <Table.BodyCell style={{ width: 55, textAlign: 'center' }}>
                        <Checkbox
                          checked={checked}
                          onChange={(event) => {
                            const currentlySelected = activeUser?.favorites.projectIds ?? [];
                            const nextProjectIds = event.currentTarget.checked
                              ? [...currentlySelected, project.id]
                              : currentlySelected.filter((id) => id !== project.id);
                            updateFavoriteSelections(nextProjectIds, activeUser?.favorites.toolKeys ?? []);
                          }}
                          aria-label={`Favorite ${project.label}`}
                        />
                      </Table.BodyCell>
                      <Table.BodyCell><Table.TextCell>{project.label}</Table.TextCell></Table.BodyCell>
                    </Table.BodyRow>
                  );
                })}
              </Table.Body>
            </Table>
          </Table.Container>
        </Card>

        <Card style={{ marginBottom: 16, padding: 16 }}>
          <H2 style={{ marginBottom: 16 }}>Favorite Tools</H2>
          <Table.Container>
            <Table>
              <Table.Header>
                <Table.HeaderRow>
                  <Table.HeaderCell style={{ width: 55, textAlign: 'center' }}>{' '}</Table.HeaderCell>
                  <Table.HeaderCell>Tool</Table.HeaderCell>
                </Table.HeaderRow>
              </Table.Header>
              <Table.Body>
                {toolOptions.map((tool) => {
                  const checked = Boolean(activeUser?.favorites.toolKeys.includes(tool.id as ToolKey));
                  return (
                    <Table.BodyRow key={tool.id}>
                      <Table.BodyCell style={{ width: 55, textAlign: 'center' }}>
                        <Checkbox
                          checked={checked}
                          onChange={(event) => {
                            const currentlySelected = activeUser?.favorites.toolKeys ?? [];
                            const nextToolIds = event.currentTarget.checked
                              ? [...currentlySelected, tool.id as ToolKey]
                              : currentlySelected.filter((id) => id !== tool.id);
                            updateFavoriteSelections(activeUser?.favorites.projectIds ?? [], nextToolIds);
                          }}
                          aria-label={`Favorite ${tool.label}`}
                        />
                      </Table.BodyCell>
                      <Table.BodyCell><Table.TextCell>{tool.label}</Table.TextCell></Table.BodyCell>
                    </Table.BodyRow>
                  );
                })}
              </Table.Body>
            </Table>
          </Table.Container>
        </Card>
      </>
    );
  }

  function renderNotificationsTab() {
    return (
      <Card>
        <Form initialValues={{ emailFrequency: 'Immediate', digestTime: '08:00 AM' }} onSubmit={() => undefined}>
          <Form.Form style={FORM_CARD_STYLE}>
            <H2 style={{ marginBottom: 16 }}>Notifications</H2>
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
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button variant="primary" type="submit">Save Notifications</Button>
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
            <H2 style={{ marginBottom: 16 }}>Password & Security</H2>
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
                    <Table.BodyCell><Button variant="tertiary" size="sm" disabled>Current Session</Button></Table.BodyCell>
                  </Table.BodyRow>
                  <Table.BodyRow>
                    <Table.BodyCell><Table.TextCell>iPhone 15</Table.TextCell></Table.BodyCell>
                    <Table.BodyCell><Table.TextCell>Dallas, TX</Table.TextCell></Table.BodyCell>
                    <Table.BodyCell><Table.TextCell>2 hours ago</Table.TextCell></Table.BodyCell>
                    <Table.BodyCell><Button variant="secondary" size="sm">Revoke</Button></Table.BodyCell>
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
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button variant="primary" type="submit">Save Security Settings</Button>
            </Form.SettingsPageFooter>
          </Form.Form>
        </Form>
      </Card>
    );
  }

  return (
    <>
      <ProfileTearsheetWidth />
      <Tearsheet open={open} onClose={onClose} aria-label="My profile settings" placement="right">
        <div
          className="profile-settings-tearsheet-root"
          style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}
        >
        <Page style={{ height: '100%' }}>
          <Page.Main style={{ height: '100%', overflow: 'hidden' }}>
            <Page.Header>
              <Page.Title><Typography intent="h2">My Profile Settings</Typography></Page.Title>
              <Page.Tabs>
                <Tabs>
                  {PROFILE_TABS.map((tab) => (
                    <Tabs.Tab key={tab} role="button" selected={selectedTab === tab} onPress={() => setSelectedTab(tab)}>
                      {tab}
                    </Tabs.Tab>
                  ))}
                </Tabs>
              </Page.Tabs>
            </Page.Header>
            <Page.Body style={{ padding: 24, overflowY: 'auto' }}>
              {selectedTab === 'Personal' && (
                <Card>
                  <Form initialValues={initialValues} onSubmit={handleProfileSave} enableReinitialize>
                    <Form.Form style={FORM_CARD_STYLE}>
                      <H2 style={{ marginBottom: 16 }}>Personal Info</H2>
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
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" type="submit">Save Profile</Button>
                      </Form.SettingsPageFooter>
                    </Form.Form>
                  </Form>
                </Card>
              )}
              {selectedTab === 'Preferences' && renderPreferencesTab()}
              {selectedTab === 'Favorites' && renderFavoritesTab()}
              {selectedTab === 'Notifications' && renderNotificationsTab()}
              {selectedTab === 'Password & Security' && renderPasswordAndSecurityTab()}
              {selectedTab === 'Connected Apps' && renderConnectedAppsTab()}
            </Page.Body>
          </Page.Main>
        </Page>
        </div>
      </Tearsheet>
    </>
  );
}

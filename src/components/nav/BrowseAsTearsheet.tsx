/**
 * BROWSE AS TEARSHEET
 * Lists all team members in a table. Supports:
 *  - Making any user the active persona
 *  - Drilling into a user's tool permissions (edit view)
 */
import React, { useState } from 'react';
import { Button, Dropdown, Table, Tearsheet, Typography } from '@procore/core-react';
import styled, { createGlobalStyle } from 'styled-components';
import { CaretLeft, Pencil, Check, Person } from '@procore/core-icons';
import { usePersona } from '@/context/PersonaContext';
import { TOOL_DISPLAY_NAMES, TOOL_LEVEL_MAP } from '@/types/tools';
import type { ToolKey } from '@/types/tools';
import type { ToolPermissionLevel } from '@/types/permissions';
import type { User, UserRole } from '@/types/user';

// ─── Width override ────────────────────────────────────────────────────────────
// Tearsheet renders into a Portal so we must use createGlobalStyle to reach it.
const TearsheetWidthOverride = createGlobalStyle`
  .sc-ljrxoq-1 {
    flex: 0 0 60vw !important;
  }
`;

// ─── Styled components ────────────────────────────────────────────────────────

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--color-border-separator);
  flex-shrink: 0;
`;

const HeaderText = styled.div`
  flex: 1;
  min-width: 0;
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const AvatarCircle = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
`;

const AvatarImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TableCard = styled.div`
  margin: 16px;
  border: 1px solid var(--color-border-separator);
  border-radius: 8px;
  background: var(--color-surface-primary);
  overflow: hidden;
`;

// ── Permission detail view ──────────────────────────────────────────────────

const PermTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const PermTHead = styled.thead``;

const PermTBody = styled.tbody``;

const PermTr = styled.tr`
  border-bottom: 1px solid var(--color-border-separator);
  &:last-child { border-bottom: none; }
`;

const PermTh = styled.th`
  text-align: left;
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: var(--color-surface-tertiary);
  border-bottom: 1px solid var(--color-border-default);
`;

const PermTd = styled.td`
  padding: 10px 16px;
  font-size: 14px;
  color: var(--color-text-primary);
  vertical-align: middle;
`;

const LevelBadge = styled.span<{ $level: ToolPermissionLevel }>`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $level }) => LEVEL_BG[$level]};
  color: ${({ $level }) => LEVEL_FG[$level]};
`;

const LevelSelect = styled.select`
  height: 30px;
  border: 1px solid var(--color-border-default);
  border-radius: 4px;
  font-size: 13px;
  padding: 0 6px;
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  &:focus { outline: none; border-color: var(--color-border-focus); }
`;

const SectionDivider = styled.div`
  padding: 8px 16px 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--color-surface-tertiary);
  border-bottom: 1px solid var(--color-border-separator);
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const PERSONA_COLORS = [
  '#e36c00', '#0070d2', '#3d6600', '#5867e8',
  '#c23934', '#7b5ea7', '#006e8a', '#b35900',
  '#1a6e3c', '#7a4cad', '#c43e00', '#0054a6',
];

const LEVEL_BG: Record<ToolPermissionLevel, string> = {
  none:   '#f5f6f7',
  read:   '#e8f0fe',
  update: '#fff3cd',
  create: '#d4edda',
  admin:  '#f8d7da',
};

const LEVEL_FG: Record<ToolPermissionLevel, string> = {
  none:   '#6a767c',
  read:   '#1d5cc9',
  update: '#856404',
  create: '#155724',
  admin:  '#721c24',
};

const PERMISSION_LEVELS: ToolPermissionLevel[] = ['none', 'read', 'update', 'create', 'admin'];

const LEVEL_LABELS: Record<ToolPermissionLevel, string> = {
  none:   'No Access',
  read:   'Read Only',
  update: 'Update',
  create: 'Create',
  admin:  'Admin',
};

const ROLE_OPTIONS: UserRole[] = [
  'Executive Strategy',
  'Operations & Administration',
  'Project Delivery',
  'Field Opperations',
];

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

function resolveUserPermission(user: User, toolKey: ToolKey): ToolPermissionLevel {
  // toolGranted overrides toolDefaults
  const granted = user.permissions.toolGranted[toolKey];
  if (granted) return granted;
  const def = user.permissions.toolDefaults[toolKey];
  if (def) return def;
  // denied tools
  if (user.permissions.toolDenied.includes(toolKey)) return 'none';
  return 'none';
}

const ALL_TOOL_KEYS = Object.keys(TOOL_DISPLAY_NAMES) as ToolKey[];

// Group tools by level for the permissions table
const PORTFOLIO_TOOLS = ALL_TOOL_KEYS.filter(
  (k) => TOOL_LEVEL_MAP[k] === 'portfolio' || TOOL_LEVEL_MAP[k] === 'both'
);
const PROJECT_TOOLS = ALL_TOOL_KEYS.filter(
  (k) => TOOL_LEVEL_MAP[k] === 'project' || TOOL_LEVEL_MAP[k] === 'both'
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface PermissionOverrides {
  [toolKey: string]: ToolPermissionLevel;
}

// ─── Sub-view: Permissions Editor ─────────────────────────────────────────────

function PermissionsView({
  user,
  onBack,
}: {
  user: User;
  onBack: () => void;
}) {
  const [overrides, setOverrides] = useState<PermissionOverrides>({});

  function getEffective(toolKey: ToolKey): ToolPermissionLevel {
    return overrides[toolKey] ?? resolveUserPermission(user, toolKey);
  }

  function handleChange(toolKey: ToolKey, level: ToolPermissionLevel) {
    setOverrides((prev) => ({ ...prev, [toolKey]: level }));
  }

  function renderGroup(tools: ToolKey[], groupLabel: string) {
    return (
      <>
        <SectionDivider>{groupLabel}</SectionDivider>
        {tools.map((toolKey) => {
          const effective = getEffective(toolKey);
          return (
            <PermTr key={toolKey}>
              <PermTd style={{ fontWeight: 500 }}>{TOOL_DISPLAY_NAMES[toolKey]}</PermTd>
              <PermTd>
                <LevelBadge $level={effective}>{LEVEL_LABELS[effective]}</LevelBadge>
              </PermTd>
              <PermTd>
                <LevelSelect
                  value={getEffective(toolKey)}
                  onChange={(e) => handleChange(toolKey, e.target.value as ToolPermissionLevel)}
                  aria-label={`${TOOL_DISPLAY_NAMES[toolKey]} permission`}
                >
                  {PERMISSION_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{LEVEL_LABELS[lvl]}</option>
                  ))}
                </LevelSelect>
              </PermTd>
            </PermTr>
          );
        })}
      </>
    );
  }

  return (
    <>
      <Header>
        <Button
          className="b_tertiary"
          variant="tertiary"
          icon={<CaretLeft />}
          onClick={onBack}
          aria-label="Back to team members"
        />
        <HeaderText>
          <Typography intent="h2" style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block' }}>
            {user.role} · Tool Permissions
          </Typography>
        </HeaderText>
      </Header>

      <Body>
        <PermTable>
          <PermTHead>
            <PermTr>
              <PermTh style={{ width: '40%' }}>Tool</PermTh>
              <PermTh style={{ width: '25%' }}>Current Level</PermTh>
              <PermTh style={{ width: '35%' }}>Override</PermTh>
            </PermTr>
          </PermTHead>
          <PermTBody>
            {renderGroup(PORTFOLIO_TOOLS, 'Portfolio & Shared Tools')}
            {renderGroup(PROJECT_TOOLS.filter((k) => !PORTFOLIO_TOOLS.includes(k)), 'Project-Only Tools')}
          </PermTBody>
        </PermTable>
      </Body>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface BrowseAsTearsheetProps {
  open: boolean;
  onClose: () => void;
}

export default function BrowseAsTearsheet({ open, onClose }: BrowseAsTearsheetProps) {
  const { activeUser, setActiveUser, users } = usePersona();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roleOverrides, setRoleOverrides] = useState<Record<string, UserRole>>({});

  function handleClose() {
    setEditingUser(null);
    onClose();
  }

  function handleRoleChange(userId: string, nextRole: UserRole) {
    setRoleOverrides((prev) => ({ ...prev, [userId]: nextRole }));
  }

  return (
    <>
      <TearsheetWidthOverride />
      <Tearsheet
        open={open}
        onClose={handleClose}
        aria-label="Browse as"
        placement="right"
        block
      >
        {editingUser ? (
          <PermissionsView
            user={editingUser}
            onBack={() => setEditingUser(null)}
          />
        ) : (
          <>
            <Header>
              <HeaderText>
                <Typography intent="h2" style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Browse as
                </Typography>
                <Typography intent="small" style={{ color: 'var(--color-text-secondary)', display: 'block', marginTop: 2 }}>
                  Switch perspective to view the app as a different team member.
                </Typography>
              </HeaderText>
            </Header>

            <Body>
              {users.length === 0 ? (
                <div style={{ padding: '24px' }}>
                  <Typography intent="body" style={{ color: 'var(--color-text-secondary)' }}>
                    No users loaded yet.
                  </Typography>
                </div>
              ) : (
                <TableCard>
                  <Table.Container>
                    <Table>
                      <Table.Header>
                        <Table.HeaderRow>
                          <Table.HeaderCell>Name</Table.HeaderCell>
                          <Table.HeaderCell>Email</Table.HeaderCell>
                          <Table.HeaderCell>Role</Table.HeaderCell>
                          <Table.HeaderCell>Active</Table.HeaderCell>
                          <Table.HeaderCell>Actions</Table.HeaderCell>
                        </Table.HeaderRow>
                      </Table.Header>
                      <Table.Body>
                        {users.map((user, idx) => {
                          const isActive = activeUser?.id === user.id;
                          const color = PERSONA_COLORS[idx % PERSONA_COLORS.length];
                          const selectedRole = roleOverrides[user.id] ?? user.role;
                          return (
                            <Table.BodyRow key={user.id}>
                              {/* Name */}
                              <Table.BodyCell style={{ paddingLeft: 16, paddingRight: 16 }}>
                                <NameCell>
                                  {user.avatar ? (
                                    <AvatarImage
                                      src={user.avatar}
                                      alt={`${user.firstName} ${user.lastName}`}
                                    />
                                  ) : (
                                    <AvatarCircle $color={color}>
                                      {getInitials(user.firstName, user.lastName)}
                                    </AvatarCircle>
                                  )}
                                  <Typography intent="body" style={{ fontWeight: isActive ? 600 : 400, color: 'var(--color-text-primary)' }}>
                                    {user.firstName} {user.lastName}
                                  </Typography>
                                </NameCell>
                              </Table.BodyCell>

                              {/* Email */}
                              <Table.BodyCell>
                                <Table.TextCell>{user.email}</Table.TextCell>
                              </Table.BodyCell>

                              {/* Role */}
                              <Table.BodyCell>
                                <Dropdown label={selectedRole} className="b_secondary" variant="secondary">
                                  {ROLE_OPTIONS.map((role) => (
                                    <Dropdown.Item
                                      key={role}
                                      item={role}
                                      onClick={() => handleRoleChange(user.id, role)}
                                    >
                                      {role}
                                    </Dropdown.Item>
                                  ))}
                                </Dropdown>
                              </Table.BodyCell>

                              {/* Active */}
                              <Table.BodyCell>
                              <ActionButtons>
                                {isActive ? (
                                  <Button
                                    className="b_tertiary"
                                    variant="tertiary"
                                    size="sm"
                                    icon={<Check />}
                                    aria-label={`${user.firstName} ${user.lastName} is active`}
                                  >
                                    Active
                                  </Button>
                                ) : (
                                  <Button
                                    className="b_tertiary"
                                    variant="tertiary"
                                    size="sm"
                                    icon={<Person />}
                                    onClick={() => { setActiveUser(user); handleClose(); }}
                                  >
                                    Make Active
                                  </Button>
                                )}
                              </ActionButtons>
                              </Table.BodyCell>

                              {/* Actions */}
                              <Table.BodyCell>
                                <ActionButtons>
                                  <Button
                                  className="b_secondary"
                                  variant="secondary"
                                    size="sm"
                                    icon={<Pencil />}
                                    onClick={() => setEditingUser(user)}
                                    aria-label={`Edit permissions for ${user.firstName} ${user.lastName}`}
                                >
                                  Edit
                                </Button>
                                </ActionButtons>
                              </Table.BodyCell>
                            </Table.BodyRow>
                          );
                        })}
                      </Table.Body>
                    </Table>
                  </Table.Container>
                </TableCard>
              )}
            </Body>
          </>
        )}
      </Tearsheet>
    </>
  );
}

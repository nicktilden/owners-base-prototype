/**
 * ACCOUNT SETTINGS CONTENT
 * Client-only content for the /settings page.
 * Matches the Procore settings directory layout:
 * Account Settings | Company Settings | Project Settings | Tool Settings | Payments & Billing | Security
 */

import Head from 'next/head';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import {
  H1,
  Title,
  ToolLandingPage,
  Typography,
  UNSAFE_AnchorNavigation as AnchorNavigation,
} from '@procore/core-react';
import {
  Building,
  Person,
  Cog,
  ChartBar,
  Calendar,
  Check,
  Warning,
  File,
  Key,
  Sliders,
  ConcentricCircles,
  Search,
  CurrencyUSA,
  Lock,
  List,
  GlobalNetwork,
  Pushpin,
  WrenchHammer,
  Ruler,
  Book,
  Bell,
  ShieldStar,
  Insights,
  ClipboardBulletedChecks,
  Toolbox,
  Archive,
  Wrench,
  Clock,
} from '@procore/core-icons';
import SettingsCard from '@/components/settings/SettingsCard';
import AppLayout from '@/components/nav/AppLayout';

const GlobalHeader = dynamic(() => import('@/components/nav/GlobalHeader'), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingItem {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

interface SettingSection {
  id: string;
  label: string;
  items: SettingItem[];
}

// ─── Icon helper ──────────────────────────────────────────────────────────────
const IC = 'var(--color-surface-secondary)';

// ─── Settings data ────────────────────────────────────────────────────────────

const SECTIONS: SettingSection[] = [
  {
    id: 'account',
    label: 'Account Settings',
    items: [
      { icon: <Cog size="sm" />,       iconColor: IC, title: 'App Management',      description: 'Install, configure, and manage apps connected to your account', href: '/settings/app-management' },
      { icon: <ConcentricCircles size="sm" />, iconColor: IC, title: 'Procore Explore', description: 'Discover and enable new Procore features and beta programs', href: '/settings/procore-explore', badge: 'Beta' },
      { icon: <Archive size="sm" />,   iconColor: IC, title: 'Release Management',  description: 'Control feature rollout schedules and release channels', href: '/settings/release-management' },
    ],
  },
  {
    id: 'company',
    label: 'Company Settings',
    items: [
      { icon: <Pushpin size="sm" />,      iconColor: IC, title: 'Classifications',            description: 'Manage classification codes and categories used across projects', href: '/settings/classifications' },
      { icon: <Building size="sm" />,    iconColor: IC, title: 'Company Information',        description: 'Company name, logo, address, and contact details', href: '/settings/company' },
      { icon: <Bell size="sm" />,        iconColor: IC, title: 'Conversations',              description: 'Configure conversation and messaging settings for your company', href: '/settings/conversations' },
      { icon: <CurrencyUSA size="sm" />, iconColor: IC, title: 'Currency Settings',          description: 'Set default currency, exchange rates, and multi-currency preferences', href: '/settings/currency', badge: 'Beta' },
      { icon: <ChartBar size="sm" />,    iconColor: IC, title: 'Expense Allocations',        description: 'Define expense allocation methods and cost distribution rules', href: '/settings/expense-allocations' },
      { icon: <Sliders size="sm" />,     iconColor: IC, title: 'General Settings',           description: 'Account-wide defaults for timezone, language, and display preferences', href: '/settings/general' },
      { icon: <Warning size="sm" />,     iconColor: 'var(--color-pill-bg-yellow)', title: 'Risk Register Configuration', description: 'Active KPIs, score thresholds, scoring templates, and scope', href: '/settings/health-risk', badge: 'New' },
      { icon: <ChartBar size="sm" />,    iconColor: IC, title: 'Root Cause Analysis',        description: 'Configure root cause categories for issues, incidents, and observations', href: '/settings/root-cause' },
      { icon: <WrenchHammer size="sm" />,iconColor: IC, title: 'Trades',                    description: 'Manage trade categories and specialty contractor classifications', href: '/settings/trades' },
      { icon: <Ruler size="sm" />,       iconColor: IC, title: 'Unit of Measure Master List',description: 'Define standard units of measure used in quantities and estimates', href: '/settings/units' },
      { icon: <List size="sm" />,        iconColor: IC, title: 'Work Breakdown Structure',   description: 'Define WBS code hierarchy and cost code structure for your portfolio', href: '/settings/wbs' },
    ],
  },
  {
    id: 'project',
    label: 'Project Settings',
    items: [
      { icon: <Calendar size="sm" />, iconColor: IC, title: 'Dates',            description: 'Configure project date types, calendars, and working day rules', href: '/settings/dates', badge: 'Beta' },
      { icon: <Cog size="sm" />,      iconColor: IC, title: 'Project Defaults', description: 'Default project types, stages, regions, and template settings', href: '/settings/project-defaults' },
      { icon: <Sliders size="sm" />,  iconColor: IC, title: 'Project Fieldset', description: 'Customize fields and metadata shown on project records', href: '/settings/project-fieldset' },
      { icon: <Person size="sm" />,   iconColor: IC, title: 'Roles',            description: 'Define project roles, responsibilities, and permission templates', href: '/settings/roles' },
    ],
  },
  {
    id: 'tools',
    label: 'Tool Settings',
    items: [
      { icon: <ClipboardBulletedChecks size="sm" />, iconColor: IC, title: 'Action Plans',           description: 'Configure action plan types, templates, and approval workflows', href: '/settings/action-plans', badge: 'Beta' },
      { icon: <Toolbox size="sm" />,       iconColor: IC, title: 'Bidding',                description: 'Set up bid packages, invitation defaults, and scoring criteria', href: '/settings/bidding' },
      { icon: <ChartBar size="sm" />,      iconColor: IC, title: 'Budget',                 description: 'WBS code structure, budget line item types, and cost codes', href: '/settings/budget' },
      { icon: <Wrench size="sm" />,        iconColor: IC, title: 'Change Management',      description: 'Approval thresholds, change types, and workflow routing', href: '/settings/change-events' },
      { icon: <ConcentricCircles size="sm" />, iconColor: IC, title: 'Contextual Help',   description: 'Customize in-app help content and contextual guidance for users', href: '/settings/contextual-help' },
      { icon: <File size="sm" />,          iconColor: IC, title: 'Contracts & Change Orders', description: 'Contract types, change order workflows, and approval levels', href: '/settings/contracts' },
      { icon: <Bell size="sm" />,          iconColor: IC, title: 'Correspondence',         description: 'Correspondence types, templates, and distribution settings', href: '/settings/correspondence' },
      { icon: <GlobalNetwork size="sm" />, iconColor: IC, title: 'Directory',              description: 'Manage company directory, vendor list, and contact preferences', href: '/settings/directory' },
      { icon: <Calendar size="sm" />,      iconColor: IC, title: 'Daily Log',              description: 'Configure daily log fields, weather integrations, and crew tracking', href: '/settings/daily-log' },
      { icon: <File size="sm" />,          iconColor: IC, title: 'Project Documents',      description: 'Document storage rules, folder structure, and access controls', href: '/settings/project-documents' },
      { icon: <Archive size="sm" />,       iconColor: IC, title: 'Document Management',    description: 'Document versioning, retention policies, and archiving rules', href: '/settings/document-management' },
      { icon: <Book size="sm" />,          iconColor: IC, title: 'Drawings',               description: 'Drawing set configuration, revision tracking, and markup tools', href: '/settings/drawings' },
      { icon: <ChartBar size="sm" />,      iconColor: IC, title: 'Estimating',             description: 'Estimating templates, cost libraries, and markup defaults', href: '/settings/estimating' },
      { icon: <List size="sm" />,          iconColor: IC, title: 'Forms',                  description: 'Custom form builder, field types, and submission workflows', href: '/settings/forms' },
      { icon: <Warning size="sm" />,       iconColor: IC, title: 'Incidents',              description: 'Incident types, severity levels, and reporting requirements', href: '/settings/incidents' },
      { icon: <Insights size="sm" />,      iconColor: IC, title: 'Insights',               description: 'Configure dashboards, KPI visibility, and report permissions', href: '/settings/insights' },
      { icon: <Check size="sm" />,         iconColor: IC, title: 'Inspections',            description: 'Inspection checklists, frequency rules, and sign-off workflows', href: '/settings/inspections' },
      { icon: <CurrencyUSA size="sm" />,   iconColor: IC, title: 'Invoicing',              description: 'Invoice approval workflows, payment terms, and thresholds', href: '/settings/invoicing' },
      { icon: <Clock size="sm" />,         iconColor: IC, title: 'Meetings',               description: 'Meeting types, agenda templates, and distribution defaults', href: '/settings/meetings' },
      { icon: <Person size="sm" />,        iconColor: IC, title: 'My Time',                description: 'Time entry settings, approval workflows, and overtime rules', href: '/settings/my-time' },
      { icon: <ConcentricCircles size="sm" />, iconColor: IC, title: 'Observations',       description: 'Observation types, priority levels, and resolution workflows', href: '/settings/observations' },
      { icon: <WrenchHammer size="sm" />,  iconColor: IC, title: 'Punch List',             description: 'Punch list types, priority settings, and close-out requirements', href: '/settings/punch-list' },
      { icon: <File size="sm" />,          iconColor: IC, title: 'RFIs',                   description: 'RFI types, response deadlines, and distribution list defaults', href: '/settings/rfis' },
      { icon: <Book size="sm" />,          iconColor: IC, title: 'Specifications',         description: 'Spec section structure, CSI codes, and submittal register defaults', href: '/settings/specifications' },
      { icon: <ClipboardBulletedChecks size="sm" />, iconColor: IC, title: 'Submittals',   description: 'Submittal log configuration, review workflows, and lead times', href: '/settings/submittals' },
      { icon: <File size="sm" />,          iconColor: IC, title: 'T&M Tickets',            description: 'Time and materials ticket formats, rate tables, and approval flows', href: '/settings/tm-tickets' },
      { icon: <ClipboardBulletedChecks size="sm" />, iconColor: IC, title: 'Tasks',        description: 'Task types, default assignees, priority levels, and due date rules', href: '/settings/tasks' },
      { icon: <CurrencyUSA size="sm" />,   iconColor: IC, title: 'Tax Codes',              description: 'Define tax codes, rates, and jurisdictional rules for invoicing', href: '/settings/tax-codes' },
      { icon: <Clock size="sm" />,         iconColor: IC, title: 'Timesheets',             description: 'Timesheet formats, approval chains, and payroll export settings', href: '/settings/timesheets' },
    ],
  },
  {
    id: 'payments',
    label: 'Payments & Billing',
    items: [
      { icon: <CurrencyUSA size="sm" />, iconColor: IC, title: 'Payments Settings', description: 'Configure payment methods, billing contacts, and invoice delivery', href: '/settings/payments' },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    items: [
      { icon: <ShieldStar size="sm" />, iconColor: IC, title: 'Certifications Analytics', description: 'Track compliance certifications, expiry alerts, and audit trails', href: '/settings/certifications' },
      { icon: <Lock size="sm" />,       iconColor: IC, title: 'Single Sign On Configuration', description: 'Configure SAML SSO, identity providers, and session policies', href: '/settings/sso' },
      { icon: <Key size="sm" />,        iconColor: IC, title: 'Webhooks',               description: 'Manage outbound webhooks, event subscriptions, and delivery logs', href: '/settings/webhooks' },
    ],
  },
];

// Flat list of all items for search
const ALL_ITEMS: (SettingItem & { sectionLabel: string })[] = SECTIONS.flatMap((s) =>
  s.items.map((item) => ({ ...item, sectionLabel: s.label }))
);

// ─── Styled ───────────────────────────────────────────────────────────────────

const BodyLayout = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0;
  min-height: 100%;
`;

const NavSidebar = styled.div<{ $hidden?: boolean }>`
  width: 220px;
  flex-shrink: 0;
  padding: 24px 0;
  position: sticky;
  top: 0;
  align-self: flex-start;
  display: ${({ $hidden }) => ($hidden ? 'none' : 'block')};
`;

const ContentArea = styled.div`
  flex: 1;
  min-width: 0;
  padding: 16px 40px 64px;
`;

const SearchWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  background: var(--color-surface-primary);
  border: 1.5px solid var(--color-border-default);
  border-radius: 6px;
  padding: 0 14px;
  margin-bottom: 36px;
  transition: border-color 0.15s;

  &:focus-within {
    border-color: var(--color-border-focus);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--color-text-primary);

  &::placeholder {
    color: var(--color-text-secondary);
  }
`;

const SectionBlock = styled.div`
  margin-bottom: 48px;
  &:last-child { margin-bottom: 0; }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px 0 4px;

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SearchResultsLabel = styled(Typography)`
  display: block;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
`;

const NoResults = styled.div`
  color: var(--color-text-secondary);
  font-size: 14px;
  padding: 32px 0;
  text-align: center;
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function AccountSettingsContent() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState(SECTIONS[0].id);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim().toLowerCase();
  const isSearching = trimmed.length > 0;

  const filteredItems = isSearching
    ? ALL_ITEMS.filter(
        (item) =>
          item.title.toLowerCase().includes(trimmed) ||
          item.description.toLowerCase().includes(trimmed) ||
          item.sectionLabel.toLowerCase().includes(trimmed)
      )
    : null;

  return (
    <>
      <Head>
        <title>Settings — Owner Prototype</title>
      </Head>
      <GlobalHeader />
      <AppLayout>
        <ToolLandingPage style={{ background: 'var(--color-surface-secondary)' }}>
          <ToolLandingPage.Main style={{ background: 'var(--color-surface-primary)' }}>

            <ToolLandingPage.Header style={{ background: 'var(--color-surface-primary)', borderBottom: '1px solid var(--color-border-separator)' }}>
              <ToolLandingPage.Title style={{ background: 'var(--color-surface-primary)' }}>
                <Title>
                  <Title.Text>
                    <H1 style={{ color: 'var(--color-text-primary)' }}>
                      Account Settings
                    </H1>
                  </Title.Text>
                </Title>
              </ToolLandingPage.Title>
            </ToolLandingPage.Header>

            <ToolLandingPage.Body style={{ padding: 0 }}>
              <BodyLayout>
                {/* Left nav — hidden while searching */}
                <NavSidebar $hidden={isSearching}>
                  <AnchorNavigation
                    sections={SECTIONS.map((s) => ({ id: s.id, label: s.label }))}
                    selected={selectedSection}
                    onSelect={(id) => {
                      setSelectedSection(id);
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  />
                </NavSidebar>

                <ContentArea>
                  {/* Search bar */}
                  <SearchWrap onClick={() => inputRef.current?.focus()}>
                    <Search size="sm" style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
                    <SearchInput
                      ref={inputRef}
                      placeholder="Search tool name, feature, or setting"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      aria-label="Search settings"
                    />
                  </SearchWrap>

                  {/* Search results */}
                  {filteredItems !== null ? (
                    filteredItems.length === 0 ? (
                      <NoResults>No settings found for &ldquo;{query}&rdquo;</NoResults>
                    ) : (
                      <>
                        <SearchResultsLabel intent="small">
                          {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                        </SearchResultsLabel>
                        <CardGrid>
                          {filteredItems.map((item) => (
                            <SettingsCard
                              key={item.href}
                              icon={item.icon}
                              iconColor={item.iconColor}
                              title={item.title}
                              description={item.description}
                              onClick={() => router.push(item.href)}
                              badge={item.badge}
                            />
                          ))}
                        </CardGrid>
                      </>
                    )
                  ) : (
                    /* Full section listing */
                    SECTIONS.map((section) => (
                      <SectionBlock key={section.id} id={section.id}>
                        <Typography intent="h3" style={{ color: 'var(--color-text-primary)' }}>
                          {section.label}
                        </Typography>
                        <CardGrid>
                          {section.items.map((item) => (
                            <SettingsCard
                              key={item.href}
                              icon={item.icon}
                              iconColor={item.iconColor}
                              title={item.title}
                              description={item.description}
                              onClick={() => router.push(item.href)}
                              badge={item.badge}
                            />
                          ))}
                        </CardGrid>
                      </SectionBlock>
                    ))
                  )}
                </ContentArea>
              </BodyLayout>
            </ToolLandingPage.Body>

          </ToolLandingPage.Main>
        </ToolLandingPage>
      </AppLayout>
    </>
  );
}

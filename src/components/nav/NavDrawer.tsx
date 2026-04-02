/**
 * NAV DRAWER
 * Slide-in navigation menu driven by context.
 * - Portfolio level: shows portfolio-level + 'both' tools accessible to the active user
 * - Project level: shows project-level + 'both' tools accessible to the active user
 * Tools are filtered via canAccessTool() based on the active persona.
 */
import React from 'react';
import { useRouter } from 'next/router';
import { Typography } from '@procore/core-react';
import {
  Folder,
  CurrencyUSA,
  Building,
  WrenchHammer,
  Check,
  ChartBar,
  File,
  Calendar,
  FileList,
  FileCurrencyUSA,
  ListBulleted,
  QuestionMark,
  Assets,
  People,
  Clear,
  Wrench,
  ClipboardCheck,
  NotepadList,
  Payments,
  Envelope,
  NotepadPencil,
  Home,
} from '@procore/core-icons';
import styled, { keyframes, css } from 'styled-components';
import { ProcoreLogoSvg } from './ProcoreLogoSvg';
import { useLevel } from '@/context/LevelContext';
import { usePersona } from '@/context/PersonaContext';
import { canAccessTool } from '@/utils/permissions';
import { TOOL_LEVEL_MAP, TOOL_DISPLAY_NAMES, ToolKey } from '@/types/tools';

// ─── Animations ──────────────────────────────────────────────────────────────

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
`;

const slideOut = keyframes`
  from { transform: translateX(0); }
  to   { transform: translateX(-100%); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

// ─── Styled components ────────────────────────────────────────────────────────

const Backdrop = styled.div<{ $closing: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1100;
  animation: ${({ $closing }) =>
    css`${$closing ? fadeOut : fadeIn} 0.2s ease forwards`};
`;

const Drawer = styled.nav<{ $closing: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 248px;
  background: linear-gradient(114.42deg, #000000 36.83%, #2e2e2e 81.46%);
  z-index: 1200;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 4px 28px 0px rgba(0, 0, 0, 0.28);
  animation: ${({ $closing }) =>
    css`${$closing ? slideOut : slideIn} 0.22s ease forwards`};
  overflow: hidden;
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  position: sticky;
  top: 0;
  background: #000;
  z-index: 2;
  flex-shrink: 0;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
  transition: background 0.15s;
  &:hover { background: rgba(255, 255, 255, 0.1); }
`;

const LogoWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 6px;
`;

const NavList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  overflow-y: auto;
  flex: 1;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  padding: 12px 8px;
`;

const NavItemEl = styled.a<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 8px 6px 8px 8px;
  border-radius: 6px;
  text-decoration: none;
  color: ${({ $active }) => ($active ? '#ffffff' : 'rgba(255, 255, 255, 0.85)')};
  background: ${({ $active }) => ($active ? 'rgba(117, 131, 138, 0.3)' : 'transparent')};
  flex-shrink: 0;
  transition: background 0.15s;

  &:hover { background: rgba(255, 255, 255, 0.1); }

  svg {
    flex-shrink: 0;
    color: ${({ $active }) => ($active ? '#ffffff' : 'rgba(255, 255, 255, 0.85)')};
  }
`;

// ─── Tool icon map ─────────────────────────────────────────────────────────────

const TOOL_ICONS: Partial<Record<ToolKey, React.ReactNode>> = {
  hubs:             <Home size="sm" />,
  documents:        <FileList size="sm" />,
  schedule:         <Calendar size="sm" />,
  assets:           <Assets size="sm" />,
  budget:           <ChartBar size="sm" />,
  tasks:            <Check size="sm" />,
  capital_planning: <CurrencyUSA size="sm" />,
  funding_source:   <Building size="sm" />,
  bidding:          <WrenchHammer size="sm" />,
  action_plans:     <ClipboardCheck size="sm" />,
  change_events:    <File size="sm" />,
  change_orders:    <NotepadList size="sm" />,
  invoicing:        <FileCurrencyUSA size="sm" />,
  prime_contracts:  <Payments size="sm" />,
  rfis:             <QuestionMark size="sm" />,
  punch_list:       <ListBulleted size="sm" />,
  specifications:   <NotepadPencil size="sm" />,
  submittals:       <Folder size="sm" />,
  observations:     <Wrench size="sm" />,
  correspondence:   <Envelope size="sm" />,
  commitments:      <People size="sm" />,
};

// ─── Component ────────────────────────────────────────────────────────────────

interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function NavDrawer({ open, onClose }: NavDrawerProps) {
  const router = useRouter();
  const { level, activeProjectId } = useLevel();
  const { activeUser } = usePersona();
  const [closing, setClosing] = React.useState(false);

  const currentPath = React.useMemo(() => {
    const pathWithoutQuery = router.asPath.split('?')[0]?.split('#')[0] ?? '';
    return pathWithoutQuery.replace(/\/+$/, '') || '/';
  }, [router.asPath]);
  const isProjectLevel = level === 'project' && !!activeProjectId;

  // Build the tool list for the current level, filtered by user permissions
  const toolKeys = (Object.keys(TOOL_LEVEL_MAP) as ToolKey[]).filter((key) => {
    const toolLevel = TOOL_LEVEL_MAP[key];
    const matchesLevel = isProjectLevel
      ? toolLevel === 'project' || toolLevel === 'both'
      : toolLevel === 'portfolio' || toolLevel === 'both';
    if (!matchesLevel) return false;
    if (!activeUser) return true;
    return canAccessTool(activeUser, key);
  });

  // Build nav items
  const baseHref = isProjectLevel ? `/project/${activeProjectId}` : '/portfolio';

  const toolNavItems: { key: string; label: string; icon: React.ReactNode; href: string }[] = toolKeys
    .map((key) => ({
      key,
      label: TOOL_DISPLAY_NAMES[key],
      icon: TOOL_ICONS[key] ?? <File size="sm" />,
      href: key === 'hubs'
        ? baseHref
        : `${baseHref}/${key.replace(/_/g, '-')}`,
    }))
    .sort((a, b) => {
      if (a.key === 'hubs') return -1;
      if (b.key === 'hubs') return 1;
      return a.label.localeCompare(b.label);
    });

  // Insert Project Overview as the second item when at project level
  if (isProjectLevel) {
    const projectOverviewItem = {
      key: '__project_overview__',
      label: 'Project Overview',
      icon: <Home size="sm" />,
      href: `/project/${activeProjectId}`,
    };
    toolNavItems.splice(1, 0, projectOverviewItem);
  }

  const sectionLabel = isProjectLevel ? 'PROJECT TOOLS' : 'PORTFOLIO TOOLS';

  // Close with animation
  const handleClose = React.useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 220);
  }, [onClose]);

  // Close on route change
  React.useEffect(() => {
    const handleRouteChange = () => handleClose();
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router.events, handleClose]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  if (!open && !closing) return null;

  return (
    <>
      <Backdrop $closing={closing} onClick={handleClose} aria-hidden="true" />
      <Drawer $closing={closing} aria-label="Navigation menu">
        <DrawerHeader>
          <CloseButton onClick={handleClose} aria-label="Close navigation">
            <Clear size="sm" />
          </CloseButton>
          <LogoWrap>
            <ProcoreLogoSvg />
          </LogoWrap>
        </DrawerHeader>

        <NavList>
          {/* Section header */}
          <SectionHeader>
            <Typography
              intent="small"
              style={{
                color: '#acb5b9',
                fontWeight: 600,
                letterSpacing: '0.25px',
                textTransform: 'uppercase',
              }}
            >
              {sectionLabel}
            </Typography>
          </SectionHeader>

          {toolNavItems.map((item) => {
            const normalizedHref = item.href.replace(/\/+$/, '') || '/';
            const isHomeItem = item.key === 'hubs' || item.key === '__project_overview__';
            const isActive = isHomeItem
              ? currentPath === normalizedHref
              : currentPath === normalizedHref || currentPath.startsWith(`${normalizedHref}/`);
            return (
              <NavItemEl key={item.key} href={item.href} $active={isActive}>
                {item.icon}
                <Typography intent="body" style={{ color: 'inherit' }}>
                  {item.label}
                </Typography>
              </NavItemEl>
            );
          })}

          {toolNavItems.length === 0 && (
            <div style={{ padding: '8px' }}>
              <Typography intent="small" style={{ color: 'rgba(255,255,255,0.5)' }}>
                No tools available
              </Typography>
            </div>
          )}
        </NavList>
      </Drawer>
    </>
  );
}

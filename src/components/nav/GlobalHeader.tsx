/**
 * GLOBAL HEADER
 * Fixed dark navigation bar. Context-wired:
 * - Project picker reads from DataContext + LevelContext
 * - Profile button uses activeUser from PersonaContext
 * - Company name from DataContext.account
 */
import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Typography } from '@procore/core-react';
import {
  List,
  Bell,
  Help,
  Comments,
  Building,
  CaretDown,
  CaretUp,
  Search,
} from '@procore/core-icons';
import styled from 'styled-components';
import NavDrawer from './NavDrawer';
import { usePersona } from '@/context/PersonaContext';
import { useLevel } from '@/context/LevelContext';
import { useData } from '@/context/DataContext';
import avatarImg from '@/images/avatar-XL.png';
import procoreOwnersLogo from '@/images/ProcoreOwners_LOGO.png';

const ProjectPickerPopover = dynamic(() => import('./ProjectPickerPopover'), { ssr: false });
const AppPickerPopover = dynamic(() => import('./AppPickerPopover'), { ssr: false });
const HelpPopover = dynamic(() => import('./HelpPopover'), { ssr: false });
const UserMenuPopover = dynamic(() => import('./UserMenuPopover'), { ssr: false });
const BrowseAsTearsheet = dynamic(() => import('./BrowseAsTearsheet'), { ssr: false });
const ProfileSettingsTearsheet = dynamic(() => import('./ProfileSettingsTearsheet'), { ssr: false });

// ─── Styled components ────────────────────────────────────────────────────────

const PickerWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const GLOBAL_HEADER_HEIGHT = 56;

const Bar = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${GLOBAL_HEADER_HEIGHT}px;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  z-index: 1000;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.1);
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
  flex-shrink: 0;
  transition: background 0.15s;
  &:hover { background: rgba(117, 131, 138, 0.3); }
`;

const ProcoreLogo = styled(Link)`
  display: flex;
  align-items: center;
  margin: 0 12px 0 4px;
  flex-shrink: 0;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.15s;
  &:hover { background: rgba(117, 131, 138, 0.3); }
`;

const PickerButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgb(70, 79, 83);
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  flex-shrink: 0;
  transition: background 0.15s;
  min-width: 0;
  &:hover { background: rgb(85, 95, 100); }
`;

const PickerIcon = styled.div`
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.8);
`;

const PickerLabels = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
`;

const Spacer = styled.div`
  flex: 1;
`;

const LeftActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

/* Absolutely centered in the Bar so it never overlaps LeftActions or RightActions */
const SearchBarContainer = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
  /* Constrain so it can't grow into the side groups — each side keeps its own space */
  max-width: min(480px, calc(100% - 800px));
  width: 480px;
`;

const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const IconBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  transition: background 0.15s;
  &:hover { background: rgba(117, 131, 138, 0.3); }
`;

const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition: background 0.15s;
  margin-left: 4px;
  &:hover { background: rgba(117, 131, 138, 0.3); }
`;

const AvatarImg = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
`;

const CompanyBadge = styled.div`
  height: 30px;
  padding: 0 10px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
`;

const AppPickerButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgb(70, 79, 83);
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  flex-shrink: 0;
  transition: background 0.15s;
  &:hover { background: rgb(85, 95, 100); }
`;

const SearchBarWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 36px;
  background: #ffffff;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  padding: 0 12px;
  cursor: text;
  pointer-events: auto;
  transition: border-color 0.15s, background 0.15s;
  &:focus-within {
    border-color: rgba(255, 255, 255, 0.6);
    background: #ffffff;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #6A767C;
  font-size: 14px;
  &::placeholder { color: #6A767C; }
`;

const KbdBadge = styled.kbd`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  padding: 0 6px;
  background: #EEF0F1;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 11px;
  font-family: inherit;
  color: #232729;
  white-space: nowrap;
`;

const SearchShortcut = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function GlobalHeader() {
  const [navOpen, setNavOpen] = useState(false);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [appPickerOpen, setAppPickerOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [browseAsOpen, setBrowseAsOpen] = useState(false);
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false);

  const pickerBtnRef = useRef<HTMLButtonElement>(null);
  const appPickerBtnRef = useRef<HTMLButtonElement>(null);
  const helpBtnRef = useRef<HTMLButtonElement>(null);
  const userMenuBtnRef = useRef<HTMLButtonElement>(null);

  const { activeUser } = usePersona();
  const { level, activeProjectId } = useLevel();
  const { data } = useData();

  const account = data.account;
  const companyName = account?.companyName ?? 'Procore';

  // Project picker label: show active project name if at project level
  const activeProject = activeProjectId
    ? data.projects.find((p) => p.id === activeProjectId)
    : null;
  const rawLabel = activeProject ? activeProject.name : 'Select Project';
  const pickerLabel = rawLabel.length > 22 ? rawLabel.slice(0, 22) + '…' : rawLabel;
  const pickerSublabel = level === 'project' && activeProject
    ? activeProject.number
    : companyName;

  return (
    <>
      <Bar>
        
        {/* Right actions */}
        <LeftActions>
        {/* Left: menu toggle + logo */}
        <MenuButton
          onClick={() => setNavOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={navOpen}
        >
          <List size="md" style={{ width: 24, height: 24 }} />
          <Typography color="white" intent="small" style={{ fontWeight: 600, fontSize: 14 }}>Menu</Typography>
        </MenuButton>

        <ProcoreLogo href="/portfolio">
          <img src={procoreOwnersLogo.src} alt="Procore Owners" height={32} />
        </ProcoreLogo>

        {/* Project / portfolio picker */}
        <PickerWrap>
          <PickerButton
            ref={pickerBtnRef}
            aria-label="Select project"
            aria-haspopup="dialog"
            aria-expanded={projectPickerOpen}
            onClick={() => setProjectPickerOpen((v) => !v)}
          >
            <PickerIcon>
              <Building size="sm" />
            </PickerIcon>
            <PickerLabels>
              <Typography color="white" intent="small" style={{ opacity: 0.6, lineHeight: 1 }}>
                {pickerSublabel}
              </Typography>
              <Typography color="white" intent="body" style={{ fontWeight: 600, lineHeight: 1.3 }}>
                {pickerLabel}
              </Typography>
            </PickerLabels>
            {projectPickerOpen ? <CaretUp size="sm" /> : <CaretDown size="sm" />}
          </PickerButton>
          {projectPickerOpen && (
            <ProjectPickerPopover
              anchorRef={pickerBtnRef}
              onClose={() => setProjectPickerOpen(false)}
            />
          )}
        </PickerWrap>
        </LeftActions>

        {/* Search bar */}
        <SearchBarContainer>
          <SearchBarWrap>
            <Search size="sm" style={{ color: '#6A767C', flexShrink: 0 }} />
            <SearchInput placeholder="Search" />
            <SearchShortcut>
              <KbdBadge>Cmd</KbdBadge>
              <KbdBadge>K</KbdBadge>
            </SearchShortcut>
          </SearchBarWrap>
        </SearchBarContainer>

        {/* Right actions */}
        <RightActions>
          {/* App picker */}
          <PickerWrap>
            <AppPickerButton
              ref={appPickerBtnRef}
              aria-label="Select an app"
              aria-haspopup="dialog"
              aria-expanded={appPickerOpen}
              onClick={() => setAppPickerOpen((v) => !v)}
            >
              <PickerLabels>
                <Typography color="white" intent="small" style={{ opacity: 0.6, lineHeight: 1 }}>Apps</Typography>
                <Typography color="white" intent="body" style={{ fontWeight: 600, lineHeight: 1.3 }}>Select an App</Typography>
              </PickerLabels>
              {appPickerOpen ? <CaretUp size="sm" /> : <CaretDown size="sm" />}
            </AppPickerButton>
            {appPickerOpen && (
              <AppPickerPopover
                anchorRef={appPickerBtnRef}
                onClose={() => setAppPickerOpen(false)}
              />
            )}
          </PickerWrap>

          {/* Help */}
          <PickerWrap>
            <IconBtn
              ref={helpBtnRef}
              aria-label="Help"
              aria-haspopup="dialog"
              aria-expanded={helpOpen}
              onClick={() => setHelpOpen((v) => !v)}
            >
              <Help size="sm" />
            </IconBtn>
            {helpOpen && (
              <HelpPopover
                anchorRef={helpBtnRef}
                onClose={() => setHelpOpen(false)}
              />
            )}
          </PickerWrap>

          <IconBtn aria-label="Comments">
            <Comments size="sm" />
          </IconBtn>

          <IconBtn aria-label="Notifications">
            <Bell size="sm" />
          </IconBtn>

          {/* Profile */}
          <PickerWrap>
            <ProfileButton
              ref={userMenuBtnRef}
              aria-label="User account menu"
              aria-haspopup="dialog"
              aria-expanded={userMenuOpen}
              onClick={() => setUserMenuOpen((v) => !v)}
            >
              <AvatarImg
                src={activeUser?.avatar ?? avatarImg.src}
                alt={activeUser ? `${activeUser.firstName} ${activeUser.lastName}` : 'User'}
              />
              <CompanyBadge>
                <Typography
                  intent="small"
                  style={{ color: '#fff', fontWeight: 600, lineHeight: 1, whiteSpace: 'nowrap' }}
                >
                  {companyName}
                </Typography>
              </CompanyBadge>
            </ProfileButton>
            {userMenuOpen && (
              <UserMenuPopover
                anchorRef={userMenuBtnRef}
                onClose={() => setUserMenuOpen(false)}
                onBrowseAs={() => setBrowseAsOpen(true)}
                onProfileSettings={() => setProfileSettingsOpen(true)}
              />
            )}
          </PickerWrap>
        </RightActions>
      </Bar>

      <NavDrawer open={navOpen} onClose={() => setNavOpen(false)} />
      <BrowseAsTearsheet open={browseAsOpen} onClose={() => setBrowseAsOpen(false)} />
      <ProfileSettingsTearsheet
        open={profileSettingsOpen}
        onClose={() => setProfileSettingsOpen(false)}
      />
    </>
  );
}

/**
 * USER MENU POPOVER
 * Profile flyout with:
 *   1. Persona Switcher — select which user you are browsing as (dev tool)
 *   2. Company Switcher — stub for switching accounts
 *   3. Active user info (name, role, email)
 *   4. Standard account actions (profile, settings, log out)
 */
import React, { useEffect, useRef, useState } from 'react';
import { Button, Typography } from '@procore/core-react';
import { Person, Cog, Import, Pencil } from '@procore/core-icons';
import styled from 'styled-components';
import { usePersona } from '@/context/PersonaContext';
import { useData } from '@/context/DataContext';
import avatarImg from '@/images/avatar-XL.png';

// ─── Styled components ────────────────────────────────────────────────────────

const Popover = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: 296px;
  background: var(--color-surface-primary);
  border-radius: 8px;
  box-shadow: 0px 4px 28px 0px var(--color-shadow-strong);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1300;
  color: var(--color-text-primary);

  html[data-color-scheme="dark"] & span[class],
  html[data-color-scheme="dark"] & p[class] {
    color: var(--color-text-primary);
  }
`;

const Section = styled.div`
  padding: 16px 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const SectionDivider = styled.div`
  height: 1px;
  background: var(--color-border-separator);
  flex-shrink: 0;
`;

/** Collapsible section header */
const SectionToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
  &:hover { background: var(--color-surface-hover); }
`;

const AvatarLarge = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const NameBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
`;

const ActionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
`;

const TermsText = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0.25px;
  color: var(--color-text-secondary);
  text-align: center;
  white-space: nowrap;
`;

const EditPersonaBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  transition: background 0.12s;
  &:hover { background: var(--color-surface-active); color: var(--color-text-primary); }
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface UserMenuPopoverProps {
  anchorRef: React.RefObject<HTMLElement>;
  onClose: () => void;
  onBrowseAs: () => void;
  onProfileSettings: () => void;
}

export default function UserMenuPopover({
  anchorRef,
  onClose,
  onBrowseAs,
  onProfileSettings,
}: UserMenuPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { activeUser } = usePersona();
  const { data } = useData();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [anchorRef, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const account = data.account;

  return (
    <Popover ref={popoverRef} role="dialog" aria-label="User menu">

      {/* ── ACTIVE USER PROFILE ── */}
      {activeUser && (
        <Section>
          <AvatarLarge src={activeUser.avatar ?? avatarImg.src} alt={`${activeUser.firstName} ${activeUser.lastName}`} />
          <NameBlock>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Typography intent="h3" style={{ fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
                {activeUser.firstName} {activeUser.lastName}
              </Typography>
              <EditPersonaBtn
                onClick={() => { onClose(); onBrowseAs(); }}
                aria-label="Switch persona"
                title="Browse as a different user"
              >
                <Pencil size="sm" />
              </EditPersonaBtn>
            </div>
            <Typography intent="body" style={{ color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
              {activeUser.role}
            </Typography>
            <Typography intent="body" style={{ color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
              {activeUser.email}
            </Typography>
          </NameBlock>
          <Typography intent="body" style={{ fontWeight: 600, color: 'var(--color-text-primary)', textAlign: 'center' }}>
            {account?.companyName ?? 'Acme Development Group'}
          </Typography>
        </Section>
      )}

      <SectionDivider />

      {/* ── ACTIONS ── */}
      <ActionsSection>
        <Button
          block
          className="b_secondary"
          variant="secondary"
          data-variant="secondary"
          icon={<Person size="sm" />}
          onClick={() => {
            onClose();
            onProfileSettings();
          }}
        >
          My Profile Settings
        </Button>
        <Button className="b_secondary" block variant="secondary" data-variant="secondary" icon={<Cog size="sm" />} onClick={onClose}>
          Account Settings
        </Button>
        <Button block variant="secondary" className="b_secondary" data-variant="secondary" icon={<Import size="sm" />} onClick={onClose}>
          Log Out
        </Button>
        <TermsText>Terms of Service • Privacy Notice</TermsText>
      </ActionsSection>
    </Popover>
  );
}

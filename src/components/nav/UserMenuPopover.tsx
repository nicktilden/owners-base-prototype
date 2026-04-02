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
import { Person, Cog, Import, CaretDown, CaretRight, Pencil } from '@procore/core-icons';
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
  background: #fff;
  border-radius: 8px;
  box-shadow: 0px 4px 28px 0px rgba(0, 0, 0, 0.28);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1300;
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
  background: #d6dadc;
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
  &:hover { background: #f4f5f6; }
`;

const ActiveDot = styled.div`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #1a7f37;
  margin-left: auto;
  flex-shrink: 0;
`;

const CompanyTile = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 16px;
  background: ${({ $active }) => ($active ? '#f0f7ff' : 'transparent')};
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
  &:hover { background: ${({ $active }) => ($active ? '#e3f1ff' : '#f4f5f6')}; }
`;

const CompanyIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: #e8eaeb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #232729;
  flex-shrink: 0;
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
  color: #6a767c;
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
  color: #6a767c;
  flex-shrink: 0;
  transition: background 0.12s;
  &:hover { background: #e8eaeb; color: #232729; }
`;

// Stub companies for the company switcher
const STUB_COMPANIES = [
  { id: 'acc-001', name: 'Acme Development Group' },
  { id: 'acc-demo', name: 'Demo Company' },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface UserMenuPopoverProps {
  anchorRef: React.RefObject<HTMLElement>;
  onClose: () => void;
  onBrowseAs: () => void;
}

export default function UserMenuPopover({ anchorRef, onClose, onBrowseAs }: UserMenuPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { activeUser } = usePersona();
  const { data } = useData();
  const [companyOpen, setCompanyOpen] = useState(false);
  const [activeCompanyId, setActiveCompanyId] = useState('acc-001');

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

      {/* ── COMPANY SWITCHER ── */}
      <SectionToggle
        onClick={() => setCompanyOpen((v) => !v)}
        aria-expanded={companyOpen}
        aria-controls="company-list"
      >
        <Typography intent="small" style={{ fontWeight: 600, color: '#232729', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Company
        </Typography>
        {companyOpen ? <CaretDown size="sm" /> : <CaretRight size="sm" />}
      </SectionToggle>

      {companyOpen && (
        <div id="company-list">
          {STUB_COMPANIES.map((company) => {
            const isActive = activeCompanyId === company.id;
            const initials = company.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
            return (
              <CompanyTile
                key={company.id}
                $active={isActive}
                onClick={() => setActiveCompanyId(company.id)}
                aria-pressed={isActive}
              >
                <CompanyIcon>{initials}</CompanyIcon>
                <Typography intent="body" style={{ fontWeight: isActive ? 600 : 400, color: '#232729', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {company.name}
                </Typography>
                {isActive && <ActiveDot aria-label="Active company" />}
              </CompanyTile>
            );
          })}
        </div>
      )}

      <SectionDivider />

      {/* ── ACTIVE USER PROFILE ── */}
      {activeUser && (
        <Section>
          <AvatarLarge src={activeUser.avatar ?? avatarImg.src} alt={`${activeUser.firstName} ${activeUser.lastName}`} />
          <NameBlock>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Typography intent="h3" style={{ fontWeight: 600, color: '#232729', whiteSpace: 'nowrap' }}>
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
            <Typography intent="body" style={{ color: '#6a767c', whiteSpace: 'nowrap' }}>
              {activeUser.role}
            </Typography>
            <Typography intent="body" style={{ color: '#6a767c', whiteSpace: 'nowrap' }}>
              {activeUser.email}
            </Typography>
          </NameBlock>
          <Typography intent="body" style={{ fontWeight: 600, color: '#232729', textAlign: 'center' }}>
            {account?.companyName ?? 'Acme Development Group'}
          </Typography>
        </Section>
      )}

      <SectionDivider />

      {/* ── ACTIONS ── */}
      <ActionsSection>
        <Button block variant="secondary" icon={<Person size="sm" />} onClick={onClose}>
          My Profile Settings
        </Button>
        <Button block variant="secondary" icon={<Cog size="sm" />} onClick={onClose}>
          Account Settings
        </Button>
        <Button block variant="secondary" icon={<Import size="sm" />} onClick={onClose}>
          Log Out
        </Button>
        <TermsText>Terms of Service • Privacy Notice</TermsText>
      </ActionsSection>
    </Popover>
  );
}

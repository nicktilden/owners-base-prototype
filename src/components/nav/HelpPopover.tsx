/**
 * HELP POPOVER
 * Flyout tile grid for help resources.
 * Ported directly from stage-based-workflows.
 */
import React, { useEffect, useRef } from 'react';
import { Typography } from '@procore/core-react';
import styled from 'styled-components';

const Popover = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: 296px;
  background: var(--color-surface-primary);
  border-radius: 8px;
  box-shadow: 0px 4px 28px 0px var(--color-shadow-strong);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  z-index: 1300;
  color: var(--color-text-primary);

  html[data-color-scheme="dark"] & span[class],
  html[data-color-scheme="dark"] & p[class] {
    color: var(--color-text-primary);
  }
`;

const Tile = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 124px;
  height: 124px;
  padding: 8px;
  background: var(--color-surface-hover);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s;
  flex-shrink: 0;
  &:hover { background: var(--color-surface-active); }
`;

const IconWrap = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TileLabel = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0.25px;
  color: var(--color-text-primary);
  text-align: center;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: var(--color-border-separator);
  flex-shrink: 0;
`;

const SystemStatus = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 40px;
  gap: 2px;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

// Inline SVG icons (unchanged from source)
const IconLiveChat = () => (
  <svg width="27" height="31" viewBox="0 0 27 31" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M13.5 1C6.596 1 1 6.149 1 12.5c0 3.427 1.591 6.497 4.125 8.625L4 27l6.5-3.25C11.29 24.24 12.38 24.5 13.5 24.5c6.904 0 12.5-5.149 12.5-11.5S20.404 1 13.5 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <circle cx="8.5" cy="12.5" r="1.5" fill="currentColor"/>
    <circle cx="13.5" cy="12.5" r="1.5" fill="currentColor"/>
    <circle cx="18.5" cy="12.5" r="1.5" fill="currentColor"/>
  </svg>
);
const IconSupportCenter = () => (
  <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="1" y="1" width="34" height="26" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1 7h34" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M18 1v6" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 13h10M6 17h8M6 21h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M21 13h9M21 17h9M21 21h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconCommunity = () => (
  <svg width="34" height="22" viewBox="0 0 34 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="17" cy="8" r="4.25" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 21c0-4.418 4.029-8 9-8s9 3.582 9 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="5" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1 21c0-3.314 1.79-6 4-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="29" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M33 21c0-3.314-1.79-6-4-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconContactSupport = () => (
  <svg width="32" height="23" viewBox="0 0 32 23" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="1" y="1" width="30" height="21" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1 3l15 10L31 3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);
const IconWebinars = () => (
  <svg width="29" height="31" viewBox="0 0 29 31" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="1" y="1" width="27" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7 21v4M22 21v4M4 25h21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M11 8l8 4-8 4V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);
const IconTrainingVideos = () => (
  <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="1" y="1" width="29" height="29" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4 5h23M4 10h23M4 15h23M4 20h23M4 25h23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.3"/>
    <rect x="4" y="5" width="23" height="13" rx="1" fill="var(--color-surface-secondary)" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 8.5l7 4-7 4v-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);
const IconPostIdea = () => (
  <svg width="22" height="31" viewBox="0 0 22 31" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M11 1C6.582 1 3 4.582 3 9c0 2.8 1.4 5.271 3.533 6.8L7 20h8l.467-4.2C17.6 14.271 19 11.8 19 9c0-4.418-3.582-8-8-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M8 20h6M8.5 23.5h5M10 27h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M11 5v4M9 7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconCertification = () => (
  <svg width="34" height="32" viewBox="0 0 34 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="1" y="1" width="32" height="22" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 8h22M6 12h14M6 16h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="26" cy="23" r="6" fill="var(--color-surface-secondary)" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M23 23l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2.5 8.5l3.5 3.5 7.5-8" stroke="#1a7f37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HELP_TILES = [
  { id: 'live-chat',        label: 'Live\nChat',                    icon: <IconLiveChat /> },
  { id: 'support-center',  label: 'Support\nCenter',               icon: <IconSupportCenter /> },
  { id: 'community',       label: 'Procore\nCommunity',            icon: <IconCommunity /> },
  { id: 'contact-support', label: 'Contact\nSupport',              icon: <IconContactSupport /> },
  { id: 'webinars',        label: 'Live\nWebinars',                icon: <IconWebinars /> },
  { id: 'training-videos', label: 'Quick How-To\nTraining Videos', icon: <IconTrainingVideos /> },
  { id: 'post-idea',       label: 'Post an\nIdea',                 icon: <IconPostIdea /> },
  { id: 'certification',   label: 'Procore\nCertification',        icon: <IconCertification /> },
];

interface HelpPopoverProps {
  anchorRef: React.RefObject<HTMLElement>;
  onClose: () => void;
}

export default function HelpPopover({ anchorRef, onClose }: HelpPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

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

  return (
    <Popover ref={popoverRef} role="dialog" aria-label="Help menu">
      {HELP_TILES.map((tile) => (
        <Tile key={tile.id} onClick={onClose} aria-label={tile.label.replace('\n', ' ')}>
          <IconWrap>{tile.icon}</IconWrap>
          <TileLabel>
            {tile.label.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </TileLabel>
        </Tile>
      ))}
      <Divider />
      <SystemStatus>
        <Typography intent="body" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
          System Status
        </Typography>
        <StatusRow>
          <IconCheck />
          <Typography intent="body" style={{ color: 'var(--color-text-primary)' }}>
            All systems operational
          </Typography>
        </StatusRow>
      </SystemStatus>
    </Popover>
  );
}

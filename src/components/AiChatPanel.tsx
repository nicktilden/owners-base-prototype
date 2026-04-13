/**
 * AI CHAT PANEL
 * Slides in from the right. Default 500px, can expand to full width.
 * Skills selector at bottom, streaming-style message animation.
 * Each button click starts a fresh chat.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Typography, Button, Pill, colors, spacing, borderRadius } from '@procore/core-react';
import {
  Copilot,
  Clear,
  Comment,
  Duplicate,
  Fullscreen,
  FullscreenExit,
  CaretDown,
  Plus,
  Check,
  Paperclip,
  RotateClockwise,
  ThumbUp,
} from '@procore/core-icons';
import { useAiPanel, type AiPanelContextData } from '@/context/AiPanelContext';
import {
  sampleProjectRows,
  sampleProjectMilestones,
  scheduleVarianceData,
} from '@/data/projects';
import {
  sampleOpenItemRows,
  type OpenItemRow,
  type RfiDetailData,
  getItemDetailData,
} from '@/data/openitems';

// ─── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_WIDTH = 500;
const FULL_WIDTH_OFFSET = 64;
const BRAND = colors.orange50;
const BRAND_DARK = colors.orange45;
const BRAND_BG = colors.orange98;

interface Skill {
  id: string;
  name: string;
  description: string;
}

const SKILLS: Skill[] = [
  { id: 'schedule-analyst', name: 'Schedule Analyst', description: 'Schedule variance, critical path, and milestone analysis' },
  { id: 'cost-advisor', name: 'Cost Advisor', description: 'Budget forecasting, change order impact, and financial health' },
  { id: 'risk-monitor', name: 'Risk Monitor', description: 'Identifies and prioritizes project risks' },
  { id: 'document-drafter', name: 'Document Drafter', description: 'Generates RFIs, change orders, memos, and correspondence' },
  { id: 'project-updater', name: 'Draft Project Update', description: 'Summarize how a project is coming along' },
  { id: 'item-reviewer', name: 'Item Reviewer', description: 'Analyzes open items — RFIs, punch lists, submittals, observations, and issues' },
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  streaming?: boolean;
  /** Skill name shown as a badge on the message */
  skillLabel?: string;
}

// ─── Styled Components ──────────────────────────────────────────────────────

const Backdrop = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.18);
  z-index: 1100;
  opacity: ${(p) => (p.$visible ? 1 : 0)};
  pointer-events: ${(p) => (p.$visible ? 'auto' : 'none')};
  transition: opacity 250ms ease;
`;

const Panel = styled.div<{ $open: boolean; $width: number }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: ${(p) => p.$width}px;
  max-width: 100vw;
  z-index: 1200;
  background: ${colors.white};
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  transform: translateX(${(p) => (p.$open ? '0' : '100%')});
  transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1),
    width 300ms cubic-bezier(0.22, 1, 0.36, 1);
  color: ${colors.gray15};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md}px;
  padding: 14px 20px;
  border-bottom: 1px solid ${colors.gray94};
  flex-shrink: 0;
  min-height: 56px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm + spacing.xxs}px;
  flex: 1;
  min-width: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm}px;
  flex-shrink: 0;
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg}px;
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const MessageRow = styled.div<{ $role: 'user' | 'assistant' }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: ${(p) => (p.$role === 'user' ? 'flex-end' : 'flex-start')};
  animation: ${slideUp} 300ms ease both;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const SkillBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.xs}px;
  background: ${BRAND_BG};
  padding: 3px 10px;
  border-radius: ${borderRadius.md}px;
`;

const UserBubble = styled.div`
  max-width: 85%;
  padding: 10px ${spacing.lg}px;
  border-radius: ${spacing.lg}px ${spacing.lg}px ${borderRadius.md}px ${spacing.lg}px;
  background: ${colors.gray96};
  border: 1px solid ${colors.gray94};
  color: ${colors.gray15};
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
`;

const AssistantBubble = styled.div`
  max-width: 90%;
  padding: ${spacing.xxs}px 0;
  color: ${colors.gray30};
  font-size: 14px;
  line-height: 1.65;
  word-break: break-word;

  p { margin: 0 0 ${spacing.sm}px; }
  p:last-child { margin-bottom: 0; }

  strong { color: ${colors.gray15}; font-weight: 600; }

  ul, ol {
    margin: ${spacing.xs}px 0 ${spacing.sm}px;
    padding-left: ${spacing.xl}px;
  }
  li { margin-bottom: ${spacing.xxs}px; }

  hr {
    border: none;
    border-top: 1px solid ${colors.gray90};
    margin: ${spacing.md}px 0;
  }
`;

const WorkingLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${colors.gray45};
  padding: ${spacing.xs}px 0;
`;

const ResponseActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xxs}px;
  padding-top: ${spacing.xs}px;
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const WelcomeArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${spacing.md}px;
  padding: 40px ${spacing.xxl}px;
  text-align: center;
  animation: ${fadeIn} 400ms ease;
`;

const SuggestionChip = styled.button`
  padding: ${spacing.sm}px ${spacing.lg}px;
  border: 1px solid ${colors.gray85};
  border-radius: 20px;
  background: ${colors.white};
  font-size: 13px;
  color: ${colors.gray30};
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;

  &:hover {
    border-color: ${BRAND};
    background: ${BRAND_BG};
    color: ${BRAND};
  }
`;

const InputArea = styled.div`
  padding: ${spacing.md}px ${spacing.lg}px 14px;
  border-top: 1px solid ${colors.gray94};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm}px;
`;

const InputRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${spacing.sm}px;
`;

const TextInput = styled.textarea`
  flex: 1;
  min-height: 42px;
  max-height: 160px;
  padding: 10px 14px;
  border: 1.5px solid ${colors.gray85};
  border-radius: ${spacing.md}px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.4;
  resize: none;
  outline: none;
  color: ${colors.gray15};
  background: ${colors.white};
  transition: border-color 0.15s;

  &:focus {
    border-color: ${BRAND};
  }

  &::placeholder {
    color: ${colors.gray60};
  }
`;

const SendButton = styled.button<{ $active: boolean }>`
  width: 40px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: ${(p) => (p.$active ? BRAND : colors.gray94)};
  color: ${(p) => (p.$active ? colors.white : colors.gray60)};
  cursor: ${(p) => (p.$active ? 'pointer' : 'default')};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: ${(p) => (p.$active ? BRAND_DARK : colors.gray94)};
  }
`;

const InputFooter = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm}px;
  padding: 0 ${spacing.xxs}px;
`;

const IconButton = styled.button`
  width: ${spacing.xxl}px;
  height: ${spacing.xxl}px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.gray45};
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;

  &:hover {
    background: ${colors.gray94};
    color: ${colors.gray15};
  }
`;

const SkillsSelectorWrap = styled.div`
  position: relative;
`;

const SkillsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: ${spacing.xs}px 10px;
  border: 1px solid ${colors.gray85};
  border-radius: 6px;
  background: ${colors.white};
  cursor: pointer;
  font-size: 13px;
  color: ${colors.gray45};
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    border-color: ${BRAND};
    color: ${BRAND};
  }
`;

const SkillsDropdown = styled.div`
  position: absolute;
  bottom: calc(100% + ${spacing.sm}px);
  left: 0;
  width: 300px;
  background: ${colors.white};
  border: 1px solid ${colors.gray85};
  border-radius: 10px;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
  z-index: 10;
  overflow: hidden;
`;

const SkillOption = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: ${(p) => (p.$active ? BRAND_BG : colors.white)};
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
  color: ${colors.gray15};

  &:hover {
    background: ${BRAND_BG};
  }
`;

const dotPulse = keyframes`
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: ${spacing.xs}px;
  align-items: center;
  padding: 10px 0;
  align-self: flex-start;
`;

const Dot = styled.span<{ $delay: number }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${colors.gray60};
  animation: ${dotPulse} 1.2s infinite ease-in-out;
  animation-delay: ${(p) => p.$delay}ms;
`;

const NewChatButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: ${spacing.xs}px 10px;
  border: 1px solid ${colors.gray85};
  border-radius: 6px;
  background: ${colors.white};
  cursor: pointer;
  font-size: 12px;
  color: ${colors.gray45};
  transition: border-color 0.15s, color 0.15s;

  &:hover {
    border-color: ${BRAND};
    color: ${BRAND};
  }
`;

const spinAnimation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid ${colors.gray94};
  border-top-color: ${BRAND};
  border-radius: 50%;
  animation: ${spinAnimation} 0.8s linear infinite;
`;

// ─── Detail Pane (split view) ───────────────────────────────────────────────

const SplitLayout = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const detailFadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const DetailPane = styled.div<{ $animKey?: number }>`
  flex: 1;
  overflow-y: auto;
  background: ${colors.white};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  line-height: 1.65;
  color: ${colors.gray15};
  padding: ${spacing.xl}px ${spacing.xxl}px;
  animation: ${detailFadeIn} 0.5s ease-out both;

  h1 {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 ${spacing.xs}px;
    color: ${colors.gray15};
    line-height: 1.3;
  }

  h2 {
    font-size: 16px;
    font-weight: 600;
    margin: ${spacing.lg}px 0 ${spacing.sm}px;
    color: ${colors.gray15};
    line-height: 1.3;
  }

  hr {
    border: none;
    border-top: 1px solid ${colors.gray90};
    margin: ${spacing.lg}px 0;
  }

  p {
    margin: 0 0 ${spacing.sm}px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: ${spacing.sm}px 0 ${spacing.md}px;
    font-size: 14px;
  }

  th {
    text-align: left;
    font-weight: 600;
    color: ${colors.gray45};
    padding: ${spacing.xs}px ${spacing.sm}px ${spacing.xs}px 0;
    white-space: nowrap;
    vertical-align: top;
    width: 160px;
  }

  td {
    padding: ${spacing.xs}px 0;
    color: ${colors.gray15};
    vertical-align: top;
  }

  .badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
  }

  .badge-blue {
    background: #e4ecfb;
    border: 1px solid #bcd1f5;
    color: #1d5cc9;
  }

  .badge-green {
    background: #e0f5e9;
    border: 1px solid #ade0c3;
    color: #1b7f40;
  }

  .badge-yellow {
    background: #fff3d6;
    border: 1px solid #ffe4a0;
    color: #8c6d1f;
  }

  .badge-red {
    color: ${colors.red40};
    font-weight: 600;
    font-size: 12px;
  }

  .badge-official {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 700;
    line-height: 16px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: #e0f5e9;
    border: 1px solid #ade0c3;
    color: #1b7f40;
    margin-left: 6px;
    vertical-align: middle;
    font-style: normal;
  }

  .response-block {
    border: 1px solid ${colors.gray90};
    border-radius: 6px;
    padding: ${spacing.md}px;
    margin-bottom: ${spacing.sm}px;
    background: ${colors.gray98};
  }

  .response-meta {
    font-size: 13px;
    color: ${colors.gray45};
    font-style: italic;
    margin: 0 0 ${spacing.xs}px;
  }

  .response-body {
    margin: 0;
  }

  .attachment {
    color: ${colors.blue50};
    text-decoration: underline;
    font-size: 13px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 ${spacing.xl}px;
  }
`;

const ChatPane = styled.div`
  width: 500px;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-left: 1px solid ${colors.gray94};
`;

function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateWithTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }) + ' at ' + d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function statusBadgeClass(status: string): string {
  if (status === 'Open') return 'badge badge-blue';
  if (status === 'In Review' || status === 'Pending') return 'badge badge-yellow';
  if (status === 'Closed') return 'badge badge-green';
  return 'badge';
}

function buildDetailHtml(item: OpenItemRow, detail: RfiDetailData): string {
  const overdue = item.daysOverdue > 0;

  let html = `<h1>${item.number}: ${item.title}</h1>`;
  html += `<span class="${statusBadgeClass(item.status)}">${item.status}</span>`;
  html += ` &nbsp; <strong>${item.type}</strong> · ${item.projectName}`;
  html += `<hr/>`;

  html += `<h2>Request</h2>`;
  html += `<table>`;
  html += `<tr><th>Subject</th><td>${detail.subject}</td></tr>`;
  html += `</table>`;
  html += `<p><strong>Question</strong></p>`;
  html += `<p>${detail.question}</p>`;
  if (detail.attachments.length > 0) {
    html += `<p><strong>Attachments</strong></p>`;
    detail.attachments.forEach((att) => {
      html += `<p><a class="attachment" href="${att.url}">📎 ${att.filename}</a></p>`;
    });
  }

  html += `<hr/>`;
  html += `<h2>Responses (${detail.responses.length})</h2>`;
  detail.responses.forEach((resp) => {
    html += `<div class="response-block">`;
    html += `<p class="response-meta"><strong>${resp.author}</strong> · ${formatDateWithTime(resp.date)}`;
    if (resp.isOfficial) {
      html += ` <span class="badge-official">OFFICIAL</span>`;
    }
    html += `</p>`;
    html += `<p class="response-body">${resp.body}</p>`;
    if (resp.attachments.length > 0) {
      resp.attachments.forEach((att) => {
        html += `<p><a class="attachment" href="${att.url}">📎 ${att.filename}</a></p>`;
      });
    }
    html += `</div>`;
  });

  html += `<hr/>`;
  html += `<h2>General Information</h2>`;
  html += `<div class="info-grid">`;
  html += `<table>`;
  html += `<tr><th>Stage &amp; Number</th><td>${detail.stageAndNumber}</td></tr>`;
  html += `<tr><th>Due Date</th><td>${formatDateLong(item.dueDate)}${overdue ? ` <span class="badge-red">(+${item.daysOverdue}d overdue)</span>` : ''}</td></tr>`;
  html += `<tr><th>RFI Manager</th><td>${detail.rfiManager}</td></tr>`;
  html += `<tr><th>Status</th><td><span class="${statusBadgeClass(item.status)}">${item.status}</span></td></tr>`;
  html += `<tr><th>Received From</th><td>${detail.receivedFrom}</td></tr>`;
  html += `<tr><th>Assignees</th><td>${detail.assignees}${detail.assigneeStatus === 'Response Required' ? '<br/><span class="badge-red">Response Required</span>' : ''}</td></tr>`;
  html += `<tr><th>Ball in Court</th><td>${detail.ballInCourt}</td></tr>`;
  html += `<tr><th>Resp. Contractor</th><td>${detail.responsibleContractor}</td></tr>`;
  html += `</table>`;
  html += `<table>`;
  html += `<tr><th>Distribution List</th><td>${detail.distributionList.join('<br/>')}</td></tr>`;
  html += `<tr><th>Location</th><td>${detail.location}</td></tr>`;
  html += `<tr><th>Specification</th><td>${item.specSection}</td></tr>`;
  html += `<tr><th>Drawing Number</th><td>${detail.drawingNumber}</td></tr>`;
  html += `<tr><th>Cost Code</th><td>${detail.costCode}</td></tr>`;
  html += `<tr><th>Created By</th><td>${detail.createdBy}</td></tr>`;
  html += `<tr><th>Date Initiated</th><td>${formatDateWithTime(detail.dateInitiated)}</td></tr>`;
  html += `<tr><th>Schedule Impact</th><td>${detail.scheduleImpact}</td></tr>`;
  html += `<tr><th>Cost Impact</th><td>${detail.costImpact}</td></tr>`;
  html += `</table>`;
  html += `</div>`;

  return html;
}

function ItemDetailPane({ item, detail }: { item: OpenItemRow; detail: RfiDetailData }) {
  const [visible, setVisible] = useState(false);
  const [renderedHtml, setRenderedHtml] = useState('');
  const revisionRef = useRef(0);

  useEffect(() => {
    revisionRef.current += 1;
    const rev = revisionRef.current;
    setVisible(false);
    const timer = setTimeout(() => {
      if (rev === revisionRef.current) {
        setRenderedHtml(buildDetailHtml(item, detail));
        setVisible(true);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [item, detail]);

  if (!visible) {
    return (
      <DetailPane style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
        <Typography intent="body" color="gray45">Loading details…</Typography>
      </DetailPane>
    );
  }

  return <DetailPane key={revisionRef.current} dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
}

// ─── Simulated Responses ────────────────────────────────────────────────────

const WELCOME_SUGGESTIONS = [
  'Summarize my portfolio risks',
  'Which projects are behind schedule?',
  'Draft a delay notice for the GC',
  'What needs my attention today?',
];

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getAutoPromptForContext(ctx: AiPanelContextData): string {
  if (ctx.cardType === 'open_items' && ctx.itemId) {
    return `Review ${ctx.itemName} — summarize the issue, assess priority and risk, and recommend next steps.`;
  }
  if (ctx.cardType === 'open_items') {
    return `Summarize my open items — highlight overdue items, group by type, and recommend what I should tackle first.`;
  }
  if (ctx.cardType === 'schedule_variance' && ctx.projectId) {
    return `Analyze the schedule for ${ctx.itemName} — show me the milestone status, key risks, and recommended actions.`;
  }
  if (ctx.itemId) {
    return `Tell me about ${ctx.itemName} (${ctx.itemId}) — what are the key risks and what actions should I take?`;
  }
  return `Analyze the current status of ${ctx.itemName ?? 'this item'} and recommend next steps.`;
}

function buildProjectScheduleResponse(projectId: number): string {
  const project = sampleProjectRows.find((p) => p.id === projectId);
  if (!project) return '';

  const milestones = sampleProjectMilestones.get(projectId) ?? [];
  const variance = scheduleVarianceData.find((d) => d.project === project.name);
  const overallVariance = variance?.variance ?? 0;

  const delayed = milestones.filter((m) => m.varianceDays > 0);
  const onTrack = milestones.filter((m) => m.varianceDays <= 0);
  const worst = [...milestones].sort((a, b) => b.varianceDays - a.varianceDays);

  let response = `**Schedule Analysis: ${project.name}**\n`;
  response += `📍 ${project.location} · Stage: ${project.stage}\n`;
  response += `📅 ${formatDateShort(project.startDate)} → ${formatDateShort(project.endDate)}\n\n`;

  response += `**Overall Status:** ${overallVariance > 0 ? `+${overallVariance} days behind schedule` : 'On schedule'}\n\n`;

  response += `**Milestone Summary** (${milestones.length} total)\n`;
  response += `• ✅ ${onTrack.length} on track or ahead\n`;
  response += `• ⚠️ ${delayed.length} delayed\n\n`;

  if (worst.length > 0 && worst[0].varianceDays > 0) {
    response += `**Most Impacted Milestones:**\n`;
    worst.filter((m) => m.varianceDays > 0).slice(0, 4).forEach((m) => {
      const status = m.varianceDays >= 14 ? '🔴' : m.varianceDays >= 7 ? '🟡' : '🟠';
      response += `${status} **${m.name}** — +${m.varianceDays}d (baseline: ${formatDateShort(m.baselineDate)}`;
      if (m.actualDate) {
        response += `, actual: ${formatDateShort(m.actualDate)}`;
      }
      response += `)\n`;
    });
    response += `\n`;
  }

  if (onTrack.length > 0) {
    response += `**On Track / Ahead:**\n`;
    onTrack.slice(0, 3).forEach((m) => {
      const status = m.varianceDays < 0 ? '🟢 Ahead' : '✅ On time';
      response += `• ${m.name} — ${status}${m.varianceDays < 0 ? ` (${m.varianceDays}d)` : ''}\n`;
    });
    response += `\n`;
  }

  response += `**✅ Recommended Actions:**\n`;
  if (overallVariance >= 14) {
    response += `1. Escalate to the owner's representative with a formal delay impact summary\n`;
    response += `2. Request a recovery schedule from the GC within 5 business days\n`;
    response += `3. Evaluate potential cost impact of ${overallVariance}-day delay on the budget\n`;
    response += `4. Consider schedule compression options for remaining milestones\n`;
  } else if (overallVariance >= 7) {
    response += `1. Request a written recovery plan from the GC\n`;
    response += `2. Increase schedule monitoring cadence to weekly check-ins\n`;
    response += `3. Review upcoming milestones for early warning signs\n`;
  } else if (overallVariance > 0) {
    response += `1. Monitor the delayed milestones in the next weekly update\n`;
    response += `2. Confirm the GC's plan to recover the minor slippage\n`;
  } else {
    response += `1. Continue standard monitoring — this project is tracking well\n`;
    response += `2. Review upcoming milestones to maintain the current pace\n`;
  }

  response += `\nWould you like me to draft a communication to the GC or generate a detailed milestone report?`;

  return response;
}

const CURRENT_USER = 'Sidney Shah';

function buildOpenItemResponse(itemId: string): string {
  const item = sampleOpenItemRows.find((r) => r.number === itemId);
  if (!item) return '';

  const overdue = item.daysOverdue > 0;
  const riskLevel = item.priority === 'Critical' ? 'Critical' : item.priority === 'High' ? 'High' : 'Moderate';

  let response = `**${item.type} Review: ${item.number}**\n`;
  response += `**${item.title}**\n\n`;

  response += `**Details:**\n`;
  response += `• **Project:** ${item.projectName}\n`;
  response += `• **Status:** ${item.status}\n`;
  response += `• **Priority:** ${item.priority}\n`;
  response += `• **Trade:** ${item.trade}\n`;
  response += `• **Due:** ${formatDateShort(item.dueDate)}${overdue ? ` (${item.daysOverdue} days overdue)` : ''}\n`;
  response += `• **Spec Section:** ${item.specSection}\n\n`;

  response += `**Risk Assessment:** ${riskLevel}\n`;
  if (overdue) {
    response += `⚠️ This item is **${item.daysOverdue} days past due** and requires immediate attention.\n\n`;
  } else {
    response += `✅ This item is on track for the due date.\n\n`;
  }

  response += `**✅ Recommended Actions:**\n`;
  if (item.type === 'RFI') {
    response += `1. Review the question and gather input from the design team\n`;
    response += `2. Coordinate with ${item.trade} trade for technical clarification\n`;
    response += `3. Draft a response and route for approval\n`;
    if (overdue) response += `4. Notify the GC of the expected response timeline\n`;
  } else if (item.type === 'Submittal') {
    response += `1. Review the submittal package against the specification (${item.specSection})\n`;
    response += `2. Verify material compliance and code requirements\n`;
    response += `3. Mark as approved, approved-as-noted, or revise-and-resubmit\n`;
    if (overdue) response += `4. Expedite review — this is blocking ${item.trade} procurement\n`;
  } else if (item.type === 'Punch List') {
    response += `1. Verify the deficiency in the field\n`;
    response += `2. Coordinate with the ${item.trade} subcontractor for correction\n`;
    response += `3. Schedule re-inspection after the fix is complete\n`;
  } else if (item.type === 'Observation') {
    response += `1. Assess safety and compliance implications\n`;
    response += `2. Document the condition with photos\n`;
    response += `3. Issue a corrective action notice to the responsible party\n`;
    if (item.priority === 'Critical') response += `4. Stop work in the affected area until resolved\n`;
  } else {
    response += `1. Investigate the root cause and gather field data\n`;
    response += `2. Coordinate with ${item.trade} and the project team\n`;
    response += `3. Develop a resolution plan with timeline\n`;
  }

  response += `\nWould you like me to draft a response, escalate this item, or pull related items on this project?`;
  return response;
}

function buildOpenItemsSummaryResponse(): string {
  const myItems = sampleOpenItemRows.filter(
    (r) => r.assignee === CURRENT_USER && r.status !== 'Closed' && r.status !== 'Void'
  );
  const overdue = myItems.filter((r) => r.daysOverdue > 0);
  const byType: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  for (const item of myItems) {
    byType[item.type] = (byType[item.type] ?? 0) + 1;
    byPriority[item.priority] = (byPriority[item.priority] ?? 0) + 1;
  }

  let response = `**My Open Items Summary**\n`;
  response += `📋 **${myItems.length} total open items** assigned to you\n\n`;

  response += `**By Type:**\n`;
  for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    response += `• **${type}:** ${count}\n`;
  }
  response += `\n`;

  response += `**By Priority:**\n`;
  if (byPriority['Critical']) response += `🔴 **Critical:** ${byPriority['Critical']}\n`;
  if (byPriority['High']) response += `🟠 **High:** ${byPriority['High']}\n`;
  if (byPriority['Medium']) response += `🟡 **Medium:** ${byPriority['Medium']}\n`;
  if (byPriority['Low']) response += `🟢 **Low:** ${byPriority['Low']}\n`;
  response += `\n`;

  if (overdue.length > 0) {
    response += `**⚠️ Overdue Items (${overdue.length}):**\n`;
    overdue
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
      .slice(0, 5)
      .forEach((item) => {
        const icon = item.daysOverdue >= 14 ? '🔴' : item.daysOverdue >= 7 ? '🟠' : '🟡';
        response += `${icon} **${item.number}** — ${item.title} (+${item.daysOverdue}d overdue, ${item.priority})\n`;
      });
    if (overdue.length > 5) {
      response += `• ...and ${overdue.length - 5} more overdue items\n`;
    }
    response += `\n`;
  }

  response += `**✅ Recommended Focus:**\n`;
  response += `1. Address the ${overdue.length} overdue item${overdue.length !== 1 ? 's' : ''} — start with Critical and High priority\n`;
  const criticalOverdue = overdue.filter((r) => r.priority === 'Critical');
  if (criticalOverdue.length > 0) {
    response += `2. **Immediate:** ${criticalOverdue[0].number} (${criticalOverdue[0].type}) is critical and ${criticalOverdue[0].daysOverdue}d overdue\n`;
  }
  response += `3. Review pending items approaching their due dates this week\n`;

  response += `\nWould you like me to drill into a specific item, draft responses for overdue RFIs, or create a daily action plan?`;
  return response;
}

function getSimulatedResponse(ctx: AiPanelContextData | null, message: string): string {
  if (ctx?.cardType === 'open_items' && ctx?.itemId) {
    const itemResponse = buildOpenItemResponse(ctx.itemId);
    if (itemResponse) return itemResponse;
  }
  if (ctx?.cardType === 'open_items' && !ctx?.itemId) {
    return buildOpenItemsSummaryResponse();
  }
  if (ctx?.cardType === 'schedule_variance' && ctx?.projectId) {
    const projectResponse = buildProjectScheduleResponse(ctx.projectId);
    if (projectResponse) return projectResponse;
  }

  const lower = message.toLowerCase();

  if (lower.includes('risk') || lower.includes('behind schedule') || lower.includes('analyze')) {
    return `Based on your current portfolio, I've identified 3 projects with critical schedule variance:\n\n• **Metro Center Phase II** — 18 days behind on structural milestones\n• **Harbor View Tower** — 12 days behind, pending GC recovery plan\n• **Riverside Commons** — 9 days behind, weather-related delays\n\nWould you like me to draft escalation notices or request recovery plans for any of these?`;
  }

  if (lower.includes('attention') || lower.includes('today')) {
    return `Here's your daily summary:\n\n📋 **3 items need your attention:**\n1. RFI #247 from Metro Center — response due today\n2. Change Order #18 for Harbor View — awaiting your approval ($142K)\n3. Monthly draw review for Riverside Commons — due tomorrow\n\n📊 **Portfolio health:** 17/20 projects on track, 3 with delays\n\nShall I help you draft responses or take action on any of these?`;
  }

  if (lower.includes('draft') || lower.includes('notice')) {
    return `Here's a draft delay notice:\n\n---\n\n**RE: Schedule Delay Notification — Metro Center Phase II**\n\nDear [GC Contact],\n\nThis letter serves as formal notification that the Metro Center Phase II project is currently tracking 18 days behind the contractual milestone schedule.\n\nPlease submit a recovery plan within 5 business days addressing the following milestones:\n- Structural completion (originally Mar 15)\n- MEP rough-in (originally Apr 1)\n\nWe reserve all rights under the contract.\n\n---\n\nWould you like me to adjust the tone, add specific milestones, or send this through Procore correspondence?`;
  }

  if (lower.includes('summarize')) {
    return `**Portfolio Risk Summary (20 Active Projects)**\n\n🟢 **Low Risk (14 projects)** — On schedule, budget within 5%\n🟡 **Medium Risk (3 projects)** — Minor delays (3–7 days) or budget variance 5–10%\n🔴 **High Risk (3 projects)** — Critical delays (>7 days) or budget overrun >10%\n\n**Key concerns:**\n• Total portfolio variance: +4.2 avg days\n• Aggregate cost impact of delays: ~$1.8M\n• 2 projects have unresolved RFIs blocking progress\n\nWant me to drill into any specific project or risk category?`;
  }

  return `I understand you're asking about "${message}". Let me look into that.\n\nBased on your current portfolio data, I can help you with schedule analysis, risk identification, cost forecasting, and document drafting. Could you provide a bit more detail about what you'd like me to focus on?`;
}

// ─── Markdown → HTML ────────────────────────────────────────────────────────

function mdToHtml(md: string): string {
  const escaped = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  let html = escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^---$/gm, '<hr/>');

  const lines = html.split('\n');
  const result: string[] = [];
  let inList: 'ol' | 'ul' | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    const ulMatch = line.match(/^[•\-]\s+(.*)$/);
    const emojiLineMatch = line.match(/^([\u{1F300}-\u{1FAD6}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}✅⚠️📋📊📍📅]+)\s+(.*)$/u);

    if (olMatch) {
      if (inList !== 'ol') {
        if (inList) result.push(`</${inList}>`);
        result.push('<ol>');
        inList = 'ol';
      }
      result.push(`<li>${olMatch[2]}</li>`);
    } else if (ulMatch) {
      if (inList !== 'ul') {
        if (inList) result.push(`</${inList}>`);
        result.push('<ul>');
        inList = 'ul';
      }
      result.push(`<li>${ulMatch[1]}</li>`);
    } else if (emojiLineMatch) {
      if (inList !== 'ul') {
        if (inList) result.push(`</${inList}>`);
        result.push('<ul style="list-style:none;padding-left:0">');
        inList = 'ul';
      }
      result.push(`<li>${emojiLineMatch[1]} ${emojiLineMatch[2]}</li>`);
    } else {
      if (inList) {
        result.push(`</${inList}>`);
        inList = null;
      }
      if (line.trim() === '') {
        result.push('</p><p>');
      } else {
        result.push(line);
      }
    }
  }
  if (inList) result.push(`</${inList}>`);

  return `<p>${result.join('\n')}</p>`
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/<p>\s*<hr\/>\s*<\/p>/g, '<hr/>')
    .replace(/<p>\s*<(ol|ul)>/g, '<$1>')
    .replace(/<\/(ol|ul)>\s*<\/p>/g, '</$1>');
}

// ─── Streaming helper ───────────────────────────────────────────────────────

function useStreamingText(fullText: string, active: boolean, onComplete: () => void) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    if (!active || !fullText) return;
    indexRef.current = 0;
    setDisplayed('');

    const interval = setInterval(() => {
      indexRef.current += 1 + Math.floor(Math.random() * 2);
      if (indexRef.current >= fullText.length) {
        setDisplayed(fullText);
        clearInterval(interval);
        onComplete();
      } else {
        setDisplayed(fullText.slice(0, indexRef.current));
      }
    }, 18);

    return () => clearInterval(interval);
  }, [fullText, active]);

  return displayed;
}

function StreamingMessage({ content, onComplete }: { content: string; onComplete: () => void }) {
  const text = useStreamingText(content, true, onComplete);
  return <AssistantBubble dangerouslySetInnerHTML={{ __html: mdToHtml(text) }} />;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AiChatPanel() {
  const { open, context, closePanel } = useAiPanel();
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<OpenItemRow | null>(null);
  const [detailData, setDetailData] = useState<RfiDetailData | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastContextRef = useRef<typeof context>(null);

  const width = isFullWidth
    ? typeof window !== 'undefined'
      ? window.innerWidth - FULL_WIDTH_OFFSET
      : 1200
    : DEFAULT_WIDTH;

  // auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, streamingMsgId]);

  // focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [open]);

  // Auto-prompt: clear old chat and start fresh each time context changes
  useEffect(() => {
    if (!open || !context?.itemName) return;
    if (lastContextRef.current === context) return;
    lastContextRef.current = context;

    // Auto-select the appropriate skill based on card type
    let autoSkill: Skill | null = null;
    if (context.cardType === 'schedule_variance') {
      autoSkill = SKILLS.find((s) => s.id === 'schedule-analyst') ?? null;
    } else if (context.cardType === 'budget' || context.cardType === 'financial_scorecard') {
      autoSkill = SKILLS.find((s) => s.id === 'cost-advisor') ?? null;
    } else if (context.cardType === 'open_items') {
      autoSkill = SKILLS.find((s) => s.id === 'item-reviewer') ?? null;
    }
    if (autoSkill) setSelectedSkill(autoSkill);

    // Clear everything for a fresh chat
    setMessages([]);
    setIsTyping(false);
    setStreamingMsgId(null);
    setInputValue('');

    const prompt = getAutoPromptForContext(context);
    const skillName = autoSkill?.name ?? selectedSkill?.name;
    const userMsg: ChatMessage = {
      id: `msg-auto-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date(),
      skillLabel: skillName,
    };

    setTimeout(() => {
      setMessages([userMsg]);
      setIsTyping(true);

      const delay = 1200 + Math.random() * 800;
      setTimeout(() => {
        const responseText = getSimulatedResponse(context, prompt);
        const assistantId = `msg-auto-${Date.now()}-resp`;
        const assistantMsg: ChatMessage = {
          id: assistantId,
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
          streaming: true,
        };
        setMessages([userMsg, assistantMsg]);
        setIsTyping(false);
        setStreamingMsgId(assistantId);
      }, delay);
    }, 400);
  }, [open, context]);

  // Reset ref when panel closes so next open is treated as new
  useEffect(() => {
    if (!open) {
      lastContextRef.current = null;
      setDetailItem(null);
      setDetailData(null);
      setIsFullWidth(false);
    }
  }, [open]);

  // close skills dropdown on outside click
  useEffect(() => {
    if (!skillsDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSkillsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [skillsDropdownOpen]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      const lower = text.trim().toLowerCase();
      const isViewDetails = lower === 'view details' || lower === 'view detail' || lower === 'show details';

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
        skillLabel: selectedSkill?.name,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputValue('');
      setIsTyping(true);

      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }

      if (isViewDetails && context?.itemId) {
        const item = sampleOpenItemRows.find((r) => r.number === context.itemId);
        if (item) {
          setTimeout(() => {
            const rfiData = getItemDetailData(item);
            setDetailItem(item);
            setDetailData(rfiData);
            setIsFullWidth(true);
            const assistantId = `msg-${Date.now()}-resp`;
            const assistantMsg: ChatMessage = {
              id: assistantId,
              role: 'assistant',
              content: `I've opened the full details for **${item.number}: ${item.title}** on the left.\n\nHere's a quick summary:\n\n• **Type:** ${item.type}\n• **Status:** ${item.status}\n• **Priority:** ${item.priority}\n• **Project:** ${item.projectName}\n• **Due:** ${formatDateShort(item.dueDate)}${item.daysOverdue > 0 ? ` (+${item.daysOverdue}d overdue)` : ''}\n\nYou can review all the details in the panel. What would you like to do next — draft a response, escalate, or pull related items?`,
              timestamp: new Date(),
              streaming: true,
            };
            setMessages((prev) => [...prev, assistantMsg]);
            setIsTyping(false);
            setStreamingMsgId(assistantId);
          }, 600);
          return;
        }
      }

      const markOfficialMatch = lower.match(/mark\s+(?:reply|response)\s+by\s+(.+?)\s+as\s+official/);
      if (markOfficialMatch && detailItem && detailData) {
        const targetName = markOfficialMatch[1].trim();
        const matchedResp = detailData.responses.find(
          (r) => r.author.toLowerCase() === targetName
        );
        if (matchedResp) {
          setTimeout(() => {
            const updatedResponses = detailData.responses.map((r) => ({
              ...r,
              isOfficial: r.id === matchedResp.id ? true : r.isOfficial,
            }));
            const updatedDetail = { ...detailData, responses: updatedResponses };
            setDetailData(updatedDetail);

            const assistantId = `msg-${Date.now()}-resp`;
            const assistantMsg: ChatMessage = {
              id: assistantId,
              role: 'assistant',
              content: `Done — I've marked **${matchedResp.author}**'s response as the **Official** reply on **${detailItem.number}**.\n\nThe detail view on the left has been updated. Is there anything else you'd like to do with this RFI?`,
              timestamp: new Date(),
              streaming: true,
            };
            setMessages((prev) => [...prev, assistantMsg]);
            setIsTyping(false);
            setStreamingMsgId(assistantId);
          }, 600);
          return;
        }
      }

      const delay = 800 + Math.random() * 1200;
      setTimeout(() => {
        const responseText = getSimulatedResponse(context, text);
        const assistantId = `msg-${Date.now()}-resp`;
        const assistantMsg: ChatMessage = {
          id: assistantId,
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
          streaming: true,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsTyping(false);
        setStreamingMsgId(assistantId);
      }, delay);
    },
    [selectedSkill, context, detailItem, detailData]
  );

  const handleStreamComplete = useCallback((msgId: string) => {
    setStreamingMsgId(null);
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, streaming: false } : m))
    );
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setIsTyping(false);
    setStreamingMsgId(null);
    setInputValue('');
    setDetailItem(null);
    setDetailData(null);
    setIsFullWidth(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const hasMessages = messages.length > 0;

  const chatContent = hasMessages ? (
    <MessagesArea>
      {messages.map((msg) => (
        <MessageRow key={msg.id} $role={msg.role}>
          {msg.role === 'user' ? (
            <>
              {msg.skillLabel && (
                <SkillBadge>
                  <Copilot size="sm" style={{ width: 12, height: 12, color: BRAND }} />
                  <Typography intent="small" weight="semibold" color="orange50">
                    {msg.skillLabel}
                  </Typography>
                </SkillBadge>
              )}
              <UserBubble>{msg.content}</UserBubble>
            </>
          ) : (
            <>
              {msg.streaming && streamingMsgId === msg.id ? (
                <>
                  <WorkingLabel>
                    <Spinner />
                    Working…
                  </WorkingLabel>
                  <StreamingMessage
                    content={msg.content}
                    onComplete={() => handleStreamComplete(msg.id)}
                  />
                </>
              ) : (
                <>
                  <AssistantBubble dangerouslySetInnerHTML={{ __html: mdToHtml(msg.content) }} />
                  <ResponseActions>
                    <Button variant="tertiary" size="sm" icon={<Duplicate size="sm" />} aria-label="Copy response" />
                    <Button variant="tertiary" size="sm" icon={<ThumbUp size="sm" />} aria-label="Good response" />
                    <Button variant="tertiary" size="sm" icon={<Comment size="sm" />} aria-label="Add feedback" />
                    <Button variant="tertiary" size="sm" icon={<RotateClockwise size="sm" />} aria-label="Regenerate response" />
                  </ResponseActions>
                </>
              )}
            </>
          )}
        </MessageRow>
      ))}
      {isTyping && (
        <TypingIndicator>
          <Dot $delay={0} />
          <Dot $delay={200} />
          <Dot $delay={400} />
        </TypingIndicator>
      )}
      <div ref={messagesEndRef} />
    </MessagesArea>
  ) : (
    <WelcomeArea>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: BRAND_BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.xs,
        }}
      >
        <Copilot size="md" style={{ color: BRAND }} />
      </div>
      <Typography intent="h3" weight="bold" color="gray15">
        How can I help?
      </Typography>
      <Typography
        intent="body"
        color="gray45"
        style={{ maxWidth: 320, lineHeight: 1.5 }}
      >
        Ask questions about your portfolio, get AI-powered insights, or draft documents.
      </Typography>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: spacing.sm,
          justifyContent: 'center',
          marginTop: spacing.sm,
        }}
      >
        {WELCOME_SUGGESTIONS.map((s) => (
          <SuggestionChip key={s} onClick={() => sendMessage(s)}>
            {s}
          </SuggestionChip>
        ))}
      </div>
    </WelcomeArea>
  );

  const inputArea = (
    <InputArea>
      <InputRow>
        <TextInput
          ref={inputRef}
          rows={1}
          placeholder="Reply…"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <SendButton
          $active={inputValue.trim().length > 0}
          onClick={() => sendMessage(inputValue)}
          aria-label="Send message"
          disabled={!inputValue.trim()}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 14V2M8 2L3 7M8 2L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </SendButton>
      </InputRow>
      <InputFooter>
        <SkillsSelectorWrap ref={dropdownRef}>
          <SkillsButton onClick={() => setSkillsDropdownOpen((v) => !v)}>
            <Copilot size="sm" style={{ width: 14, height: 14, color: BRAND }} />
            Skills
            <CaretDown
              size="sm"
              style={{
                width: 12,
                height: 12,
                color: colors.gray60,
                transition: 'transform 0.15s',
                transform: skillsDropdownOpen ? 'rotate(180deg)' : 'none',
              }}
            />
          </SkillsButton>

          {skillsDropdownOpen && (
            <SkillsDropdown>
              <div
                style={{
                  padding: '10px 14px 6px',
                  textTransform: 'uppercase' as const,
                  letterSpacing: 0.5,
                }}
              >
                <Typography intent="small" weight="semibold" color="gray45">
                  Choose a skill
                </Typography>
              </div>
              {SKILLS.map((skill) => (
                <SkillOption
                  key={skill.id}
                  $active={selectedSkill?.id === skill.id}
                  onClick={() => {
                    setSelectedSkill(
                      selectedSkill?.id === skill.id ? null : skill
                    );
                    setSkillsDropdownOpen(false);
                  }}
                >
                  <Copilot
                    size="sm"
                    style={{ width: spacing.lg, height: spacing.lg, color: BRAND, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Typography intent="small" weight="semibold" color="gray15">
                      {skill.name}
                    </Typography>
                    <Typography intent="small" color="gray45" style={{ lineHeight: 1.3 }}>
                      {skill.description}
                    </Typography>
                  </div>
                  {selectedSkill?.id === skill.id && (
                    <Check
                      size="sm"
                      style={{ color: BRAND, flexShrink: 0 }}
                    />
                  )}
                </SkillOption>
              ))}
            </SkillsDropdown>
          )}
        </SkillsSelectorWrap>

        <div style={{ flex: 1 }} />

        <IconButton aria-label="Attach file">
          <Paperclip size="sm" style={{ width: spacing.lg, height: spacing.lg }} />
        </IconButton>
      </InputFooter>
    </InputArea>
  );

  const header = (
    <Header>
      <HeaderLeft>
        <Copilot size="sm" style={{ color: BRAND, flexShrink: 0 }} />
        <Typography
          intent="h3"
          weight="bold"
          color="gray15"
          style={{ whiteSpace: 'nowrap' }}
        >
          {context?.itemName
            ? context.itemName.length > 28
              ? context.itemName.slice(0, 28) + '…'
              : context.itemName
            : 'AI Assistant'}
        </Typography>
      </HeaderLeft>
      <HeaderActions>
        {hasMessages && (
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size="sm" />}
            onClick={handleNewChat}
          >
            New chat
          </Button>
        )}
        <Button
          variant="tertiary"
          size="sm"
          icon={isFullWidth ? <FullscreenExit size="sm" /> : <Fullscreen size="sm" />}
          onClick={() => {
            setIsFullWidth((v) => {
              if (v) {
                setDetailItem(null);
                setDetailData(null);
              }
              return !v;
            });
          }}
          aria-label={isFullWidth ? 'Collapse panel' : 'Expand panel'}
        />
        <Button
          variant="tertiary"
          size="sm"
          icon={<Clear size="sm" />}
          onClick={closePanel}
          aria-label="Close AI panel"
        />
      </HeaderActions>
    </Header>
  );

  return (
    <>
      <Backdrop $visible={open} onClick={closePanel} />
      <Panel $open={open} $width={width}>
        {detailItem ? (
          <SplitLayout>
            <ItemDetailPane item={detailItem} detail={detailData!} />
            <ChatPane>
              {header}
              {chatContent}
              {inputArea}
            </ChatPane>
          </SplitLayout>
        ) : (
          <>
            {header}
            {chatContent}
            {inputArea}
          </>
        )}
      </Panel>
    </>
  );
}

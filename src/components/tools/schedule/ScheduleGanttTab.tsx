/**
 * SCHEDULE GANTT TAB
 * Gantt chart view for schedule items. Matches the Capital Planning Gantt style:
 * frozen left columns (WBS, Name, Status, % Complete, Dates) + scrolling monthly
 * time bars. Milestones render as a diamond marker.
 */

import React, { useMemo, useRef, useState } from 'react';
import { Pill, Select, Typography } from '@procore/core-react';
import styled from 'styled-components';
import type { ScheduleEntry, ScheduleItem, ScheduleStatus } from '@/types/schedule';
import { formatDateMMDDYYYY } from '@/utils/date';

// ─── Types ────────────────────────────────────────────────────────────────────

type Granularity = 'month' | 'quarter';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<ScheduleStatus, 'green' | 'yellow' | 'red' | 'gray' | 'blue'> = {
  not_started: 'gray',
  in_progress: 'blue',
  on_hold: 'yellow',
  delayed: 'red',
  complete: 'green',
};

const STATUS_LABELS: Record<ScheduleStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  delayed: 'Delayed',
  complete: 'Complete',
};

const BAR_COLORS: Record<ScheduleStatus, string> = {
  complete: 'var(--color-pill-bg-green)',
  in_progress: 'var(--color-text-link)',
  delayed: 'var(--color-pill-bg-red)',
  on_hold: 'var(--color-pill-bg-yellow)',
  not_started: 'var(--color-border-default)',
};

const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 52;
const LEFT_COL_WIDTH = 480; // total frozen left panel width

// ─── Styled components ────────────────────────────────────────────────────────

const GanttRoot = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border-default);
  border-radius: 4px;
  overflow: hidden;
  background: var(--color-surface-primary);
`;

const GanttToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 12px;
  gap: 8px;
`;

const GanttInner = styled.div`
  display: flex;
  flex-direction: row;
  overflow: hidden;
`;

/** Frozen left panel */
const LeftPanel = styled.div`
  flex: 0 0 ${LEFT_COL_WIDTH}px;
  width: ${LEFT_COL_WIDTH}px;
  border-right: 2px solid var(--color-border-default);
  display: flex;
  flex-direction: column;
  z-index: 2;
  background: var(--color-surface-primary);
`;

const LeftHeader = styled.div`
  display: flex;
  align-items: center;
  height: ${HEADER_HEIGHT}px;
  border-bottom: 1px solid var(--color-border-default);
  flex-shrink: 0;
  background: var(--color-surface-secondary);
`;

const LeftHeaderCell = styled.div<{ $width: number }>`
  width: ${({ $width }) => $width}px;
  min-width: ${({ $width }) => $width}px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-right: 1px solid var(--color-border-default);
  &:last-child { border-right: none; }
`;

const LeftBody = styled.div`
  overflow-y: hidden;
  flex: 1;
`;

const LeftRow = styled.div<{ $even: boolean }>`
  display: flex;
  align-items: center;
  height: ${ROW_HEIGHT}px;
  background: ${({ $even }) => $even ? 'var(--color-surface-secondary)' : 'var(--color-surface-primary)'};
  border-bottom: 1px solid var(--color-border-separator);
  &:last-child { border-bottom: none; }
`;

const LeftCell = styled.div<{ $width: number }>`
  width: ${({ $width }) => $width}px;
  min-width: ${({ $width }) => $width}px;
  padding: 0 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-right: 1px solid var(--color-border-separator);
  display: flex;
  align-items: center;
  &:last-child { border-right: none; }
`;

/** Scrollable right panel */
const RightPanel = styled.div`
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
`;

const TimeHeader = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  background: var(--color-surface-secondary);
  border-bottom: 1px solid var(--color-border-default);
`;

const QuarterRow = styled.div`
  display: flex;
  height: 24px;
  border-bottom: 1px solid var(--color-border-separator);
`;

const MonthRow = styled.div`
  display: flex;
  height: 28px;
`;

const QuarterCell = styled.div<{ $colSpan: number; $colWidth: number }>`
  width: ${({ $colSpan, $colWidth }) => $colSpan * $colWidth}px;
  min-width: ${({ $colSpan, $colWidth }) => $colSpan * $colWidth}px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  border-right: 1px solid var(--color-border-default);
  &:last-child { border-right: none; }
`;

const ColHeader = styled.div<{ $width: number }>`
  width: ${({ $width }) => $width}px;
  min-width: ${({ $width }) => $width}px;
  padding: 0 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--color-border-separator);
  &:last-child { border-right: none; }
`;

const TimeBody = styled.div`
  position: relative;
  flex: 1;
`;

const TimeRow = styled.div<{ $even: boolean; $totalWidth: number }>`
  display: flex;
  align-items: center;
  height: ${ROW_HEIGHT}px;
  width: ${({ $totalWidth }) => $totalWidth}px;
  background: ${({ $even }) => $even ? 'var(--color-surface-secondary)' : 'var(--color-surface-primary)'};
  border-bottom: 1px solid var(--color-border-separator);
  position: relative;
  &:last-child { border-bottom: none; }
`;

const TimeCell = styled.div<{ $width: number }>`
  width: ${({ $width }) => $width}px;
  min-width: ${({ $width }) => $width}px;
  height: 100%;
  border-right: 1px solid var(--color-border-separator);
  &:last-child { border-right: none; }
`;

const GanttBar = styled.div<{ $left: number; $width: number; $color: string; $pct: number }>`
  position: absolute;
  left: ${({ $left }) => $left}px;
  width: ${({ $width }) => Math.max($width, 4)}px;
  height: 16px;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 3px;
  background: ${({ $color }) => $color};
  opacity: 0.85;
  overflow: hidden;
  pointer-events: none;

  /* Progress overlay */
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${({ $pct }) => $pct}%;
    background: rgba(255,255,255,0.25);
    border-radius: 3px 0 0 3px;
  }
`;

const MilestoneDiamond = styled.div<{ $left: number }>`
  position: absolute;
  left: ${({ $left }) => $left}px;
  top: 50%;
  width: 12px;
  height: 12px;
  transform: translate(-50%, -50%) rotate(45deg);
  background: var(--color-text-primary);
  pointer-events: none;
`;

const TodayLine = styled.div<{ $left: number }>`
  position: absolute;
  left: ${({ $left }) => $left}px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-action-primary);
  opacity: 0.7;
  z-index: 1;
  pointer-events: none;
`;

const EmptyState = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: var(--color-text-secondary);
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isoYM(d: Date) {
  return { y: d.getFullYear(), m: d.getMonth() };
}

function monthsBetween(a: { y: number; m: number }, b: { y: number; m: number }) {
  return (b.y - a.y) * 12 + (b.m - a.m);
}

function addMonths(base: { y: number; m: number }, n: number): { y: number; m: number } {
  const total = base.m + n;
  return { y: base.y + Math.floor(total / 12), m: ((total % 12) + 12) % 12 };
}

function startOfMonth(ym: { y: number; m: number }): Date {
  return new Date(ym.y, ym.m, 1);
}

function daysInMonth(ym: { y: number; m: number }): number {
  return new Date(ym.y, ym.m + 1, 0).getDate();
}

function monthLabel(ym: { y: number; m: number }, granularity: Granularity): string {
  if (granularity === 'quarter') {
    const q = Math.floor(ym.m / 3) + 1;
    return `Q${q} '${String(ym.y).slice(2)}`;
  }
  return new Date(ym.y, ym.m, 1).toLocaleString('default', { month: 'short' });
}

function quarterLabel(ym: { y: number; m: number }): string {
  const q = Math.floor(ym.m / 3) + 1;
  return `Q${q} ${ym.y}`;
}

function pxForDate(date: Date, startYM: { y: number; m: number }, colWidth: number): number {
  const mIdx = monthsBetween(startYM, isoYM(date));
  const dim = daysInMonth({ y: date.getFullYear(), m: date.getMonth() });
  const dayFrac = (date.getDate() - 1) / dim;
  return (mIdx + dayFrac) * colWidth;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  entries: ScheduleEntry[];
  isPortfolio: boolean;
  projectMap: Map<string, string>;
}

export default function ScheduleGanttTab({ entries, isPortfolio, projectMap }: Props) {
  const [granularity, setGranularity] = useState<Granularity>('month');

  const colWidth = granularity === 'quarter' ? 160 : 80;

  const today = useMemo(() => new Date('2026-05-05'), []);

  // Compute time axis from data extents ± padding
  const { startYM, columns } = useMemo(() => {
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    entries.forEach((e) => {
      const s = e.type === 'item' ? e.startDate : e.milestoneDate;
      const f = e.type === 'item' ? e.finishDate : e.milestoneDate;
      if (!minDate || s < minDate) minDate = s;
      if (!maxDate || f > maxDate) maxDate = f;
    });

    // Fallback to a 12-month window around today
    if (!minDate) minDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    if (!maxDate) maxDate = new Date(today.getFullYear(), today.getMonth() + 10, 1);

    // Pad by 1 month on each side
    const rawStart = isoYM(minDate);
    const rawEnd = isoYM(maxDate);
    const sYM = addMonths(rawStart, -1);
    const eYM = addMonths(rawEnd, 1);

    const count = monthsBetween(sYM, eYM) + 1;
    const cols: Array<{ ym: { y: number; m: number }; label: string }> = [];
    for (let i = 0; i < count; i++) {
      const ym = addMonths(sYM, i);
      cols.push({ ym, label: monthLabel(ym, granularity) });
    }

    return { startYM: sYM, columns: cols };
  }, [entries, granularity, today]);

  // Build quarter groupings for the header
  const quarterGroups = useMemo(() => {
    const groups: Array<{ label: string; span: number }> = [];
    columns.forEach((col) => {
      const q = quarterLabel(col.ym);
      if (groups.length === 0 || groups[groups.length - 1].label !== q) {
        groups.push({ label: q, span: 1 });
      } else {
        groups[groups.length - 1].span++;
      }
    });
    return groups;
  }, [columns]);

  const totalWidth = columns.length * colWidth;
  const todayPx = pxForDate(today, startYM, colWidth);

  if (entries.length === 0) {
    return (
      <EmptyState>
        <Typography intent="body" style={{ color: 'var(--color-text-secondary)' }}>
          No schedule items to display.
        </Typography>
      </EmptyState>
    );
  }

  // Left column layout
  const wbsW = isPortfolio ? 0 : 64;
  const projW = isPortfolio ? 160 : 0;
  const nameW = isPortfolio ? 200 : 220;
  const statusW = 110;
  const pctW = 64;
  const datesW = LEFT_COL_WIDTH - wbsW - projW - nameW - statusW - pctW;

  // Sync scrollY between left and right panels
  const leftBodyRef = useRef<HTMLDivElement>(null);
  const rightBodyRef = useRef<HTMLDivElement>(null);

  function onRightScroll(e: React.UIEvent<HTMLDivElement>) {
    if (leftBodyRef.current) leftBodyRef.current.scrollTop = (e.target as HTMLDivElement).scrollTop;
  }
  function onLeftScroll(e: React.UIEvent<HTMLDivElement>) {
    if (rightBodyRef.current) rightBodyRef.current.scrollTop = (e.target as HTMLDivElement).scrollTop;
  }

  return (
    <div>
      <GanttToolbar>
        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>
          {entries.length} item{entries.length !== 1 ? 's' : ''}
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Typography intent="small" weight="semibold" as="span" style={{ flexShrink: 0 }}>
            View by
          </Typography>
          <div style={{ width: 140 }}>
            <Select
              block
              placeholder="View by"
              label={granularity === 'month' ? 'Month' : 'Quarter'}
              onSelect={(s) => {
                if (s.action !== 'selected') return;
                setGranularity(s.item as Granularity);
              }}
            >
              <Select.Option value="month" selected={granularity === 'month'}>Month</Select.Option>
              <Select.Option value="quarter" selected={granularity === 'quarter'}>Quarter</Select.Option>
            </Select>
          </div>
        </div>
      </GanttToolbar>

      <GanttRoot>
        <GanttInner>
          {/* ── Frozen left panel ── */}
          <LeftPanel>
            <LeftHeader>
              {!isPortfolio && wbsW > 0 && <LeftHeaderCell $width={wbsW}>WBS</LeftHeaderCell>}
              {isPortfolio && projW > 0 && <LeftHeaderCell $width={projW}>Project</LeftHeaderCell>}
              <LeftHeaderCell $width={nameW}>Name</LeftHeaderCell>
              <LeftHeaderCell $width={statusW}>Status</LeftHeaderCell>
              <LeftHeaderCell $width={pctW}>%</LeftHeaderCell>
              <LeftHeaderCell $width={datesW}>Dates</LeftHeaderCell>
            </LeftHeader>
            <LeftBody ref={leftBodyRef} onScroll={onLeftScroll} style={{ overflowY: 'auto', maxHeight: 560 }}>
              {entries.map((entry, i) => {
                const isItem = entry.type === 'item';
                const item = isItem ? (entry as ScheduleItem) : null;
                const startDate = isItem ? item!.startDate : (entry as any).milestoneDate;
                const finishDate = isItem ? item!.finishDate : (entry as any).milestoneDate;
                const status = isItem ? item!.status : ((entry as any).status as ScheduleStatus | undefined);
                const pct = isItem ? item!.percentComplete : null;
                const projName = projectMap.get(entry.projectId) ?? entry.projectId;

                return (
                  <LeftRow key={entry.id} $even={i % 2 === 0}>
                    {!isPortfolio && wbsW > 0 && (
                      <LeftCell $width={wbsW}>
                        <Typography intent="small" style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>
                          {entry.wbs}
                        </Typography>
                      </LeftCell>
                    )}
                    {isPortfolio && projW > 0 && (
                      <LeftCell $width={projW}>
                        <Typography intent="small" style={{ color: 'var(--color-text-link)', fontSize: 12, fontWeight: 600 }}
                          title={projName}>
                          {projName.length > 20 ? projName.slice(0, 20) + '…' : projName}
                        </Typography>
                      </LeftCell>
                    )}
                    <LeftCell $width={nameW} style={{ gap: 6 }}>
                      {!isItem && (
                        <span style={{ fontSize: 10, color: 'var(--color-text-secondary)', flexShrink: 0 }}>◆</span>
                      )}
                      <Typography intent="small" style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 13 }}
                        title={entry.name}>
                        {entry.name.length > (isPortfolio ? 22 : 26) ? entry.name.slice(0, isPortfolio ? 22 : 26) + '…' : entry.name}
                      </Typography>
                    </LeftCell>
                    <LeftCell $width={statusW}>
                      {status ? (
                        <Pill color={STATUS_COLORS[status]} style={{ fontSize: 11 }}>
                          {STATUS_LABELS[status]}
                        </Pill>
                      ) : (
                        <Typography intent="small" style={{ color: 'var(--color-text-secondary)' }}>—</Typography>
                      )}
                    </LeftCell>
                    <LeftCell $width={pctW}>
                      <Typography intent="small" style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>
                        {pct !== null ? `${pct}%` : '—'}
                      </Typography>
                    </LeftCell>
                    <LeftCell $width={datesW}>
                      <Typography intent="small" style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>
                        {formatDateMMDDYYYY(startDate)}
                        {finishDate && finishDate !== startDate ? ` – ${formatDateMMDDYYYY(finishDate)}` : ''}
                      </Typography>
                    </LeftCell>
                  </LeftRow>
                );
              })}
            </LeftBody>
          </LeftPanel>

          {/* ── Scrollable right panel ── */}
          <RightPanel
            ref={rightBodyRef}
            onScroll={onRightScroll}
            style={{ maxHeight: 560 + HEADER_HEIGHT }}
          >
            {/* Time header */}
            <TimeHeader style={{ position: 'sticky', top: 0, zIndex: 3, flexShrink: 0 }}>
              {/* Quarter row */}
              <QuarterRow>
                {quarterGroups.map((g, i) => (
                  <QuarterCell key={i} $colSpan={g.span} $colWidth={colWidth}>
                    {g.label}
                  </QuarterCell>
                ))}
              </QuarterRow>
              {/* Month row */}
              <MonthRow>
                {columns.map((col, i) => (
                  <ColHeader key={i} $width={colWidth}>
                    {granularity === 'month'
                      ? new Date(col.ym.y, col.ym.m, 1).toLocaleString('default', { month: 'short' })
                      : `Q${Math.floor(col.ym.m / 3) + 1}`}
                  </ColHeader>
                ))}
              </MonthRow>
            </TimeHeader>

            {/* Rows with bars */}
            <TimeBody style={{ width: totalWidth, flexShrink: 0 }}>
              {/* Today line */}
              <TodayLine $left={todayPx} />

              {entries.map((entry, i) => {
                const isItem = entry.type === 'item';
                const item = isItem ? (entry as ScheduleItem) : null;
                const startDate = isItem ? item!.startDate : (entry as any).milestoneDate;
                const finishDate = isItem ? item!.finishDate : (entry as any).milestoneDate;
                const status = isItem ? (item!.status as ScheduleStatus) : 'not_started';
                const pct = isItem ? item!.percentComplete : 0;

                const barLeft = pxForDate(startDate, startYM, colWidth);
                const barRight = pxForDate(finishDate, startYM, colWidth) + colWidth;
                const barWidth = Math.max(barRight - barLeft, 4);

                return (
                  <TimeRow key={entry.id} $even={i % 2 === 0} $totalWidth={totalWidth}>
                    {columns.map((col, ci) => (
                      <TimeCell key={ci} $width={colWidth} />
                    ))}
                    {isItem ? (
                      <GanttBar
                        $left={barLeft}
                        $width={barWidth}
                        $color={BAR_COLORS[status]}
                        $pct={pct}
                      />
                    ) : (
                      <MilestoneDiamond $left={barLeft} />
                    )}
                  </TimeRow>
                );
              })}
            </TimeBody>
          </RightPanel>
        </GanttInner>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 16px', borderTop: '1px solid var(--color-border-separator)', flexWrap: 'wrap' }}>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 8, borderRadius: 2, background: BAR_COLORS[key as ScheduleStatus], opacity: 0.85 }} />
              <Typography intent="small" style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{label}</Typography>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, background: 'var(--color-text-primary)', transform: 'rotate(45deg)' }} />
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>Milestone</Typography>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 2, height: 14, background: 'var(--color-action-primary)', opacity: 0.7 }} />
            <Typography intent="small" style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>Today</Typography>
          </div>
        </div>
      </GanttRoot>
    </div>
  );
}

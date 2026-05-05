import React from "react";
import styled from "styled-components";

// ─── Styled primitives ────────────────────────────────────────────────────────

const StyledTable = styled.div`
  width: 100%;
`;

const StyledHeader = styled.div`
  display: grid;
  padding: 0 8px;
  height: 28px;
  align-items: center;
  border-bottom: 1px solid var(--color-border-separator);
`;

const StyledTh = styled.span`
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 16px;
  white-space: nowrap;
  padding: 6px 0;
`;

const StyledBody = styled.div``;

const StyledTr = styled.div<{ $even?: boolean }>`
  display: grid;
  padding: 0 8px;
  min-height: 44px;
  align-items: center;
  background: ${({ $even }) =>
    $even ? "var(--color-surface-primary)" : "var(--color-surface-secondary)"};
  border-bottom: 1px solid var(--color-border-separator);
  cursor: pointer;
`;

const StyledTd = styled.div`
  font-size: 13px;
  color: var(--color-text-primary);
  vertical-align: middle;
  padding: 8px 0;
  min-width: 0;
  overflow: hidden;
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Header({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <StyledHeader style={style}>
      {children}
    </StyledHeader>
  );
}

function HeaderCell({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return <StyledTh style={style}>{children}</StyledTh>;
}

function Body({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  // If gridTemplateColumns was injected by HubCardTable, forward it to every Row child.
  const columns = style?.gridTemplateColumns;
  const styledChildren = columns
    ? React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const el = child as React.ReactElement<{ style?: React.CSSProperties }>;
        const existing = el.props.style ?? {};
        return React.cloneElement(el, {
          style: { gridTemplateColumns: columns, ...existing },
        });
      })
    : children;
  return <StyledBody>{styledChildren}</StyledBody>;
}

function Row({
  children,
  index,
  style,
  onClick,
}: {
  children: React.ReactNode;
  index: number;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <StyledTr $even={index % 2 === 0} style={style} onClick={onClick}>
      {children}
    </StyledTr>
  );
}

function Cell({
  children,
  style,
  title,
}: {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  title?: string;
}) {
  return <StyledTd style={style} title={title}>{children}</StyledTd>;
}

// ─── Main compound component ──────────────────────────────────────────────────

interface HubCardTableProps {
  children: React.ReactNode;
  /** CSS grid-template-columns value applied to both the header and every row.
   *  Defaults to repeating equal columns. Pass an explicit template when you
   *  need fixed-width action columns, e.g. "1fr 80px 80px 36px". */
  columns?: string;
  style?: React.CSSProperties;
}

function HubCardTable({ children, columns, style }: HubCardTableProps) {
  // Inject grid-template-columns onto Header and Row children automatically
  // so callers don't have to repeat the template on both.
  const styledChildren = columns
    ? React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const el = child as React.ReactElement<{ style?: React.CSSProperties }>;
        const existing = el.props.style ?? {};
        return React.cloneElement(el, {
          style: { gridTemplateColumns: columns, ...existing },
        });
      })
    : children;

  return <StyledTable style={style}>{styledChildren}</StyledTable>;
}

HubCardTable.Header = Header;
HubCardTable.HeaderCell = HeaderCell;
HubCardTable.Body = Body;
HubCardTable.Row = Row;
HubCardTable.Cell = Cell;

export default HubCardTable;

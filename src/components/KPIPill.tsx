import React from "react";
import styled from "styled-components";
import { ArrowDown, ArrowUp, Minus } from "@procore/core-icons";

type KPITone = "positive" | "negative" | "neutral";

interface KPIPillProps {
  tone: KPITone;
  value: React.ReactNode;
  trendValue: number;
  className?: string;
}

const TONE_STYLES: Record<
  KPITone,
  { bg: string; border: string; text: string }
> = {
  positive: {
    bg: "var(--color-pill-bg-green)",
    border: "var(--color-pill-border-green)",
    text: "var(--color-pill-text-green)",
  },
  negative: {
    bg: "var(--color-pill-bg-red)",
    border: "var(--color-pill-border-red)",
    text: "var(--color-pill-text-red)",
  },
  neutral: {
    bg: "var(--color-pill-bg-gray)",
    border: "var(--color-pill-border-gray)",
    text: "var(--color-pill-text-gray)",
  },
};

const Pill = styled.span<{ $tone: KPITone }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 10px;
  border: 1px solid ${({ $tone }) => TONE_STYLES[$tone].border};
  background: ${({ $tone }) => TONE_STYLES[$tone].bg};
  color: ${({ $tone }) => TONE_STYLES[$tone].text};
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
`;

function TrendIcon({ trendValue }: { trendValue: number }) {
  if (trendValue > 0) return <ArrowUp size="sm" />;
  if (trendValue < 0) return <ArrowDown size="sm" />;
  return <Minus size="sm" />;
}

export default function KPIPill({
  tone,
  value,
  trendValue,
  className,
}: KPIPillProps) {
  return (
    <Pill $tone={tone} className={className}>
      <TrendIcon trendValue={trendValue} />
      <span>{value}</span>
    </Pill>
  );
}

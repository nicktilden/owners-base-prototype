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
    bg: "#E8F7E9",
    border: "#E8F7E9",
    text: "#33993B",
  },
  negative: {
    bg: "#FAE5E5",
    border: "#FAE5E5",
    text: "#C42223",
  },
  neutral: {
    bg: "#EEF0F1",
    border: "#EEF0F1",
    text: "#6A767C",
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

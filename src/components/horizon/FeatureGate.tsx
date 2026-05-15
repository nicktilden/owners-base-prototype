import { ReactNode } from 'react';
import { useHorizon } from '@/context/HorizonContext';
import { ReleaseTimeframe } from '@/types/features';

interface FeatureGateProps {
  timeframe?: ReleaseTimeframe;
  children: ReactNode;
}

export function FeatureGate({ timeframe, children }: FeatureGateProps) {
  const { isVisible } = useHorizon();
  if (!isVisible(timeframe)) return null;
  return <>{children}</>;
}

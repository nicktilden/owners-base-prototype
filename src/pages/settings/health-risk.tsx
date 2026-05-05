import dynamic from 'next/dynamic';

const HealthRiskSettingsContent = dynamic(
  () => import('@/components/settings/HealthRiskSettingsContent'),
  { ssr: false, loading: () => null }
);

export default function HealthRiskSettingsPage() {
  return <HealthRiskSettingsContent />;
}

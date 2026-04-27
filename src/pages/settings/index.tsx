import dynamic from 'next/dynamic';

const AccountSettingsContent = dynamic(
  () => import('@/components/settings/AccountSettingsContent'),
  { ssr: false, loading: () => null }
);

export default function SettingsPage() {
  return <AccountSettingsContent />;
}

import Head from 'next/head';
import dynamic from 'next/dynamic';

const GlobalHeader = dynamic(() => import('@/components/nav/GlobalHeader'), { ssr: false });
const AppLayout = dynamic(() => import('@/components/nav/AppLayout'), { ssr: false });

export default function SettingsPage() {
  return (
    <>
      <Head>
        <title>Settings — Owner Prototype</title>
      </Head>
      <GlobalHeader />
      <AppLayout>
        <div style={{ padding: 24 }}>
          <h1>Settings</h1>
          <p>Step 15: Settings shell coming next.</p>
        </div>
      </AppLayout>
    </>
  );
}

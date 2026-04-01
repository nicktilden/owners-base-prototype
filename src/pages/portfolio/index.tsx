import Head from 'next/head';
import dynamic from 'next/dynamic';

const GlobalHeader = dynamic(() => import('@/components/nav/GlobalHeader'), { ssr: false });
const AppLayout = dynamic(() => import('@/components/nav/AppLayout'), { ssr: false });

export default function PortfolioHub() {
  return (
    <>
      <Head>
        <title>Portfolio Hub — Owner Prototype</title>
      </Head>
      <GlobalHeader />
      <AppLayout>
        <div style={{ padding: 24 }}>
          <h1>Portfolio Hub</h1>
          <p>Step 7: Hub shell coming next.</p>
        </div>
      </AppLayout>
    </>
  );
}

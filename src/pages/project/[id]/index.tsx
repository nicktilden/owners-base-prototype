import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const GlobalHeader = dynamic(() => import('@/components/nav/GlobalHeader'), { ssr: false });
const AppLayout = dynamic(() => import('@/components/nav/AppLayout'), { ssr: false });

export default function ProjectOverview() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>Project Overview — Owner Prototype</title>
      </Head>
      <GlobalHeader />
      <AppLayout>
        <div style={{ padding: 24 }}>
          <h1>Project Overview</h1>
          <p>Project ID: {id}</p>
          <p>Step 12: Project hub coming next.</p>
        </div>
      </AppLayout>
    </>
  );
}

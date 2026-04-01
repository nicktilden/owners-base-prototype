import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { TOOL_DISPLAY_NAMES, TOOL_LEVEL_MAP } from '@/types/tools';

const GlobalHeader = dynamic(() => import('@/components/nav/GlobalHeader'), { ssr: false });
const AppLayout = dynamic(() => import('@/components/nav/AppLayout'), { ssr: false });

export default function PortfolioToolPage() {
  const router = useRouter();
  const { tool } = router.query;
  const toolKey = typeof tool === 'string' ? tool.replace(/-/g, '_') : '';
  const toolName = TOOL_DISPLAY_NAMES[toolKey as keyof typeof TOOL_DISPLAY_NAMES] ?? tool;

  return (
    <>
      <Head>
        <title>{toolName} — Owner Prototype</title>
      </Head>
      <GlobalHeader />
      <AppLayout>
        <div style={{ padding: 24 }}>
          <h1>{toolName}</h1>
          <p style={{ color: '#6a767c' }}>Portfolio-level tool page — coming soon.</p>
        </div>
      </AppLayout>
    </>
  );
}

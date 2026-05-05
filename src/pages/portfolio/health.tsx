import Head from 'next/head';
import dynamic from 'next/dynamic';

const HealthContent = dynamic(() => import('@/components/tools/HealthContent'), { ssr: false });

export default function PortfolioHealthPage() {
  return (
    <>
      <Head><title>Risk Register — Owner Prototype</title></Head>
      <HealthContent scope="portfolio" />
    </>
  );
}

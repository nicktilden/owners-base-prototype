import Head from 'next/head';
import dynamic from 'next/dynamic';

const HealthRiskHubContent = dynamic(() => import('@/components/tools/HealthRiskHubContent'), { ssr: false });

export default function PortfolioHealthRiskPage() {
  return (
    <>
      <Head><title>Health & Risk — Owner Prototype</title></Head>
      <HealthRiskHubContent scope="portfolio" />
    </>
  );
}

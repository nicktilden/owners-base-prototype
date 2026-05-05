import Head from 'next/head';
import dynamic from 'next/dynamic';

const RisksContent = dynamic(() => import('@/components/risk/RisksContent'), { ssr: false });

export default function PortfolioRisksPage() {
  return (
    <>
      <Head>
        <title>Risks — Owner Prototype</title>
      </Head>
      <RisksContent />
    </>
  );
}

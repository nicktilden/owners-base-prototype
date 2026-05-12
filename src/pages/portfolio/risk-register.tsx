import Head from 'next/head';
import dynamic from 'next/dynamic';

const PortfolioRiskRegisterContent = dynamic(
  () => import('@/components/risk/PortfolioRiskRegisterContent'),
  { ssr: false }
);

export default function PortfolioRiskRegisterPage() {
  return (
    <>
      <Head>
        <title>Risk Register — Owner Prototype</title>
      </Head>
      <PortfolioRiskRegisterContent />
    </>
  );
}

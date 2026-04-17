import Head from 'next/head';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { Typography } from '@procore/core-react';

const GlobalHeader = dynamic(() => import('@/components/nav/GlobalHeader'), { ssr: false });
const AppLayout = dynamic(() => import('@/components/nav/AppLayout'), { ssr: false });

const PageWrap = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 24px;
`;

export default function SettingsPage() {
  return (
    <>
      <Head>
        <title>Settings — Owner Prototype</title>
      </Head>
      <GlobalHeader />
      <AppLayout>
        <PageWrap>
          <Typography intent="h1" style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>
            Settings
          </Typography>
          <Typography intent="body" style={{ color: 'var(--color-text-secondary)', marginBottom: 24, display: 'block' }}>
            Procore Owners theme and appearance preferences are configured from your profile settings.
          </Typography>
        </PageWrap>
      </AppLayout>
    </>
  );
}

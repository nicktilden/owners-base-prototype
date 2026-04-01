/**
 * APP LAYOUT
 * Wraps page content below the fixed GlobalHeader.
 */
import React from 'react';
import { GLOBAL_HEADER_HEIGHT } from '@/components/nav/GlobalHeader';
import styled from 'styled-components';

interface AppLayoutProps {
  children: React.ReactNode;
}

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${GLOBAL_HEADER_HEIGHT}px);
  margin-top: ${GLOBAL_HEADER_HEIGHT}px;
`;

const Main = styled.main`
  flex: 1;
  overflow-y: auto;
`;

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Layout>
      <Main>{children}</Main>
    </Layout>
  );
}

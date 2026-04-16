/**
 * TOOL PAGE LAYOUT
 * Shared chrome for every tool page. Composes GlobalHeader, AppLayout, and
 * ToolLandingPage into a single wrapper so individual tool components only
 * need to supply their title, icon, actions, tabs, and body.
 *
 * Usage:
 *   <ToolPageLayout
 *     title="Assets"
 *     icon={<Assets size="md" />}
 *     actions={<Button variant="primary" icon={<Plus />}>Add Asset</Button>}
 *     tabs={<Tabs>…</Tabs>}
 *   >
 *     ...body content...
 *   </ToolPageLayout>
 */
import React from 'react';
import dynamic from 'next/dynamic';
import { H1, Title, ToolLandingPage } from '@procore/core-react';
import styled from 'styled-components';
import AppLayout from '@/components/nav/AppLayout';

const GlobalHeader = dynamic(() => import('@/components/nav/GlobalHeader'), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ToolPageLayoutProps {
  /** Page title, e.g. "Assets" */
  title: string;
  /** Optional content after the title text inside the H1 (e.g. a Beta pill). */
  titleAddon?: React.ReactNode;
  /** Icon rendered before the H1, e.g. <Assets size="md" /> */
  icon?: React.ReactNode;
  /** Buttons / dropdowns rendered in the title actions slot */
  actions?: React.ReactNode;
  /** Tab bar rendered below the title */
  tabs?: React.ReactNode;
  /** Main body content */
  children: React.ReactNode;
}

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function ToolPageLayout({
  title,
  titleAddon,
  icon,
  actions,
  tabs,
  children,
}: ToolPageLayoutProps) {
  return (
    <>
      <GlobalHeader />
      <AppLayout>
        <ToolLandingPage>
          <ToolLandingPage.Main>
            <ToolLandingPage.Header>
              <ToolLandingPage.Title>
                <Title>
                  <Title.Text>
                    <H1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {icon}
                      {title}
                      {titleAddon}
                    </H1>
                  </Title.Text>
                  {actions && (
                    <Title.Actions>
                      <ActionsRow>{actions}</ActionsRow>
                    </Title.Actions>
                  )}
                </Title>
              </ToolLandingPage.Title>
              {tabs && (
                <ToolLandingPage.Tabs>
                  {tabs}
                </ToolLandingPage.Tabs>
              )}
            </ToolLandingPage.Header>

            <ToolLandingPage.Body>
              {children}
            </ToolLandingPage.Body>
          </ToolLandingPage.Main>
        </ToolLandingPage>
      </AppLayout>
    </>
  );
}

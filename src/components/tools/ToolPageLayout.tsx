/**
 * TOOL PAGE LAYOUT
 * Shared chrome for every tool page. Composes GlobalHeader, AppLayout, and
 * ToolLandingPage into a single wrapper so individual tool components only
 * need to supply their title, icon, breadcrumbs, actions, tabs, and body.
 *
 * Usage:
 *   <ToolPageLayout
 *     title="Assets"
 *     icon={<Assets size="md" />}
 *     breadcrumbs={[{ label: 'Portfolio', href: '/portfolio' }, { label: 'Project X', href: '/project/123' }]}
 *     actions={<Button variant="primary" icon={<Plus />}>Add Asset</Button>}
 *     tabs={<Tabs>…</Tabs>}
 *   >
 *     ...body content...
 *   </ToolPageLayout>
 */
import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Breadcrumbs,
  H1,
  Title,
  ToolLandingPage,
} from '@procore/core-react';
import styled from 'styled-components';
import AppLayout from '@/components/nav/AppLayout';

const GlobalHeader = dynamic(() => import('@/components/nav/GlobalHeader'), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ToolPageLayoutProps {
  /** Page title, e.g. "Assets" */
  title: string;
  /** Icon rendered before the H1, e.g. <Assets size="md" /> */
  icon?: React.ReactNode;
  /** Breadcrumb trail leading up to the current tool */
  breadcrumbs?: BreadcrumbItem[];
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
  icon,
  breadcrumbs = [],
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
                {breadcrumbs.length > 0 && (
                  <Breadcrumbs variant="list">
                    {breadcrumbs.map((crumb) => (
                      <Breadcrumbs.Crumb key={crumb.label}>
                        {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label}
                      </Breadcrumbs.Crumb>
                    ))}
                    <Breadcrumbs.Crumb active>{title}</Breadcrumbs.Crumb>
                  </Breadcrumbs>
                )}
                <Title>
                  <Title.Text>
                    <H1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {icon}
                      {title}
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

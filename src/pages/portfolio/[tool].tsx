import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { TOOL_DISPLAY_NAMES } from '@/types/tools';

const DocumentsContent       = dynamic(() => import('@/components/tools/DocumentsContent'),       { ssr: false });
const ScheduleContent        = dynamic(() => import('@/components/tools/ScheduleContent'),        { ssr: false });
const BudgetContent          = dynamic(() => import('@/components/tools/BudgetContent'),          { ssr: false });
const AssetsContent          = dynamic(() => import('@/components/tools/AssetsContent'),          { ssr: false });
const TasksContent           = dynamic(() => import('@/components/tools/TasksContent'),           { ssr: false });
const CapitalPlanningContent = dynamic(() => import('@/components/tools/CapitalPlanningContent'), { ssr: false });
const FundingSourceContent   = dynamic(() => import('@/components/tools/FundingSourceContent'),   { ssr: false });

const GlobalHeader = dynamic(() => import('@/components/nav/GlobalHeader'), { ssr: false });
const AppLayout    = dynamic(() => import('@/components/nav/AppLayout'),    { ssr: false });

export default function PortfolioToolPage() {
  const router = useRouter();
  const { tool } = router.query;
  const toolKey  = typeof tool === 'string' ? tool.replace(/-/g, '_') : '';
  const toolName = TOOL_DISPLAY_NAMES[toolKey as keyof typeof TOOL_DISPLAY_NAMES] ?? tool;

  // ── Portfolio-only tools ─────────────────────────────────────────────────
  if (toolKey === 'capital_planning') {
    return (
      <>
        <Head><title>Capital Planning — Owner Prototype</title></Head>
        <CapitalPlanningContent />
      </>
    );
  }

  if (toolKey === 'funding_source') {
    return (
      <>
        <Head><title>Funding Source — Owner Prototype</title></Head>
        <FundingSourceContent />
      </>
    );
  }

  // ── "Both" tools at portfolio level (no projectId) ───────────────────────
  if (toolKey === 'documents') {
    return (
      <>
        <Head><title>Documents — Owner Prototype</title></Head>
        <DocumentsContent projectId="" />
      </>
    );
  }

  if (toolKey === 'schedule') {
    return (
      <>
        <Head><title>Schedule — Owner Prototype</title></Head>
        <ScheduleContent projectId="" />
      </>
    );
  }

  if (toolKey === 'budget') {
    return (
      <>
        <Head><title>Budget — Owner Prototype</title></Head>
        <BudgetContent projectId="" />
      </>
    );
  }

  if (toolKey === 'assets') {
    return (
      <>
        <Head><title>Assets — Owner Prototype</title></Head>
        <AssetsContent projectId="" />
      </>
    );
  }

  if (toolKey === 'tasks') {
    return (
      <>
        <Head><title>Tasks — Owner Prototype</title></Head>
        <TasksContent projectId="" />
      </>
    );
  }

  // ── Placeholder for unbuilt tools ────────────────────────────────────────
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

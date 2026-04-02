import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TOOL_DISPLAY_NAMES } from '@/types/tools';
import { useLevel } from '@/context/LevelContext';

const AssetsContent     = dynamic(() => import('@/components/tools/AssetsContent'),        { ssr: false });
const TasksContent      = dynamic(() => import('@/components/tools/TasksContent'),         { ssr: false });
const DocumentsContent  = dynamic(() => import('@/components/tools/DocumentsContent'),     { ssr: false });
const ScheduleContent   = dynamic(() => import('@/components/tools/ScheduleContent'),      { ssr: false });
const BudgetContent     = dynamic(() => import('@/components/tools/BudgetContent'),        { ssr: false });
const ActionPlansContent    = dynamic(() => import('@/components/tools/ActionPlansContent'),    { ssr: false });
const RFIsContent           = dynamic(() => import('@/components/tools/RFIsContent'),          { ssr: false });
const SubmittalsContent     = dynamic(() => import('@/components/tools/SubmittalsContent'),    { ssr: false });
const PunchListContent      = dynamic(() => import('@/components/tools/PunchListContent'),     { ssr: false });
const ChangeOrdersContent   = dynamic(() => import('@/components/tools/ChangeOrdersContent'), { ssr: false });
const ChangeEventsContent   = dynamic(() => import('@/components/tools/ChangeEventsContent'), { ssr: false });
const InvoicingContent      = dynamic(() => import('@/components/tools/InvoicingContent'),    { ssr: false });
const PrimeContractsContent = dynamic(() => import('@/components/tools/PrimeContractsContent'), { ssr: false });
const ObservationsContent   = dynamic(() => import('@/components/tools/ObservationsContent'), { ssr: false });
const CorrespondenceContent = dynamic(() => import('@/components/tools/CorrespondenceContent'), { ssr: false });
const CommitmentsContent    = dynamic(() => import('@/components/tools/CommitmentsContent'),   { ssr: false });
const SpecificationsContent = dynamic(() => import('@/components/tools/SpecificationsContent'), { ssr: false });
const BiddingContent        = dynamic(() => import('@/components/tools/BiddingContent'),       { ssr: false });

const GlobalHeader = dynamic(() => import('@/components/nav/GlobalHeader'), { ssr: false });
const AppLayout    = dynamic(() => import('@/components/nav/AppLayout'),    { ssr: false });

export default function ProjectToolPage() {
  const router = useRouter();
  const { id, tool } = router.query;
  const projectId = typeof id   === 'string' ? id   : '';
  const toolKey   = typeof tool === 'string' ? tool.replace(/-/g, '_') : '';

  const { setProject } = useLevel();
  useEffect(() => {
    if (projectId) setProject(projectId);
  }, [projectId]);

  const toolName = TOOL_DISPLAY_NAMES[toolKey as keyof typeof TOOL_DISPLAY_NAMES] ?? tool;

  // ── Tool-specific pages ──────────────────────────────────────────────────
  if (toolKey === 'assets' && projectId) {
    return (
      <>
        <Head><title>Assets — Owner Prototype</title></Head>
        <AssetsContent projectId={projectId} />
      </>
    );
  }

  if (toolKey === 'tasks' && projectId) {
    return (
      <>
        <Head><title>Tasks — Owner Prototype</title></Head>
        <TasksContent projectId={projectId} />
      </>
    );
  }

  if (toolKey === 'documents' && projectId) {
    return (
      <>
        <Head><title>Documents — Owner Prototype</title></Head>
        <DocumentsContent projectId={projectId} />
      </>
    );
  }

  if (toolKey === 'schedule' && projectId) {
    return (
      <>
        <Head><title>Schedule — Owner Prototype</title></Head>
        <ScheduleContent projectId={projectId} />
      </>
    );
  }

  if (toolKey === 'budget' && projectId) {
    return (
      <>
        <Head><title>Budget — Owner Prototype</title></Head>
        <BudgetContent projectId={projectId} />
      </>
    );
  }

  if (toolKey === 'action_plans' && projectId) {
    return (
      <>
        <Head><title>Action Plans — Owner Prototype</title></Head>
        <ActionPlansContent projectId={projectId} />
      </>
    );
  }

  if (toolKey === 'rfis' && projectId) {
    return (
      <>
        <Head><title>RFIs — Owner Prototype</title></Head>
        <RFIsContent projectId={projectId} />
      </>
    );
  }

  if (toolKey === 'submittals' && projectId) {
    return (
      <>
        <Head><title>Submittals — Owner Prototype</title></Head>
        <SubmittalsContent projectId={projectId} />
      </>
    );
  }

  if (toolKey === 'punch_list' && projectId) {
    return (
      <>
        <Head><title>Punch List — Owner Prototype</title></Head>
        <PunchListContent projectId={projectId} />
      </>
    );
  }

  if (toolKey === 'change_orders' && projectId) {
    return (
      <>
        <Head><title>Change Orders — Owner Prototype</title></Head>
        <ChangeOrdersContent projectId={projectId} />
      </>
    );
  }

  if (toolKey === 'change_events' && projectId) {
    return (
      <>
        <Head><title>Change Events — Owner Prototype</title></Head>
        <ChangeEventsContent projectId={projectId} />
      </>
    );
  }

  if (toolKey === 'invoicing' && projectId) {
    return (
      <>
        <Head><title>Invoicing — Owner Prototype</title></Head>
        <InvoicingContent projectId={projectId} />
      </>
    );
  }

  if (toolKey === 'prime_contracts' && projectId) {
    return (
      <>
        <Head><title>Prime Contracts — Owner Prototype</title></Head>
        <PrimeContractsContent projectId={projectId} />
      </>
    );
  }

  if (toolKey === 'observations' && projectId) {
    return (
      <>
        <Head><title>Observations — Owner Prototype</title></Head>
        <ObservationsContent projectId={projectId} />
      </>
    );
  }

  if (toolKey === 'correspondence' && projectId) {
    return (
      <>
        <Head><title>Correspondence — Owner Prototype</title></Head>
        <CorrespondenceContent projectId={projectId} />
      </>
    );
  }

  if (toolKey === 'commitments' && projectId) {
    return (
      <>
        <Head><title>Commitments — Owner Prototype</title></Head>
        <CommitmentsContent projectId={projectId} />
      </>
    );
  }

  if (toolKey === 'specifications' && projectId) {
    return (
      <>
        <Head><title>Specifications — Owner Prototype</title></Head>
        <SpecificationsContent projectId={projectId} />
      </>
    );
  }

  if (toolKey === 'bidding' && projectId) {
    return (
      <>
        <Head><title>Bidding — Owner Prototype</title></Head>
        <BiddingContent projectId={projectId} />
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
          <p style={{ color: '#6a767c' }}>Project {id} — tool page coming soon.</p>
        </div>
      </AppLayout>
    </>
  );
}

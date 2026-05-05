import { useRouter } from 'next/router';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useLevel } from '@/context/LevelContext';

const ProjectOverviewContent = dynamic(() => import('@/components/ProjectOverviewContent'), {
  ssr: false,
  loading: () => <p style={{ padding: 24 }}>Loading...</p>,
});

export default function ProjectOverviewPage() {
  const router = useRouter();
  const { id } = router.query;
  const rawId = typeof id === 'string' ? id : '';
  const { setProject } = useLevel();

  // Resolve numeric ids (from portfolio table) to seed project ids.
  const numeric = rawId !== '' && /^\d+$/.test(rawId) ? parseInt(rawId, 10) : null;
  const projectId = numeric !== null ? `proj-${String(numeric).padStart(3, '0')}` : rawId;

  useEffect(() => {
    if (projectId) setProject(projectId);
  }, [projectId]);

  return <ProjectOverviewContent />;
}

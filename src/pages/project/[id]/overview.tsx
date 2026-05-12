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

  // Pass the raw URL id so LevelContext stores it correctly for GlobalHeader lookup.
  // "proj-001" → seed project, "2" → numeric sample project row.
  useEffect(() => {
    if (rawId) setProject(rawId);
  }, [rawId]);

  return <ProjectOverviewContent />;
}

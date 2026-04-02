import dynamic from 'next/dynamic';
const ProjectOverviewContent = dynamic(() => import("@/components/ProjectOverviewContent"), {
  ssr: false,
  loading: () => <p style={{ padding: 24 }}>Loading...</p>,
});

export default function ProjectOverviewPage() {
  return <ProjectOverviewContent />;
}

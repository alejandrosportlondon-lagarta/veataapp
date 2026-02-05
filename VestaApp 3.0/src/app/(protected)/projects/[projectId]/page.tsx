import Nav from '@/components/nav';
import Sidebar from '@/components/sidebar';
import ProjectDetail from './sections';

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />
      <div className="flex">
        <Sidebar />
        <ProjectDetail projectId={params.projectId} />
      </div>
    </div>
  );
}

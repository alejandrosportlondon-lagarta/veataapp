import Nav from '@/components/nav';
import Sidebar from '@/components/sidebar';
import DashboardContent from './sections';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />
      <div className="flex">
        <Sidebar />
        <DashboardContent />
      </div>
    </div>
  );
}

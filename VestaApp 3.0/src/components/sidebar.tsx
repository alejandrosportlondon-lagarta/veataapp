'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

async function fetchProjects() {
  const res = await fetch('/api/projects');
  if (!res.ok) return [];
  const data = await res.json();
  return data.projects as { id: string; name: string; status: string }[];
}

export default function Sidebar() {
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });

  return (
    <aside className="w-64 border-r border-slate-200 bg-white px-4 py-5 hidden md:block">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-700">Projects</span>
        <Link href="/dashboard" className="text-xs text-accent hover:underline">
          New
        </Link>
      </div>
      <div className="space-y-2">
        {projects?.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100"
          >
            {p.name}
          </Link>
        )) || <p className="text-xs text-slate-500">No projects yet</p>}
      </div>
    </aside>
  );
}

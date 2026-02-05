'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import StatusBadge from '@/components/status-badge';

async function fetchProjects() {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('Failed');
  return res.json().then((d) => d.projects as any[]);
}

async function createProject(data: any) {
  const res = await fetch('/api/projects', { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Create failed');
  return res.json();
}

export default function DashboardContent() {
  const qc = useQueryClient();
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: 'planning', dueDate: '' });

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      setModalOpen(false);
      setForm({ name: '', description: '', status: 'planning', dueDate: '' });
    }
  });

  return (
    <main className="flex-1 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Your projects</h1>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          New Project
        </button>
      </div>
      {projects && projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <a key={p.id} href={`/projects/${p.id}`} className="card p-4 space-y-2 hover:shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.name}</h3>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-sm text-slate-600 line-clamp-2">{p.description}</p>
              {p.dueDate && (
                <p className="text-xs text-slate-500">Due {new Date(p.dueDate).toLocaleDateString()}</p>
              )}
            </a>
          ))}
        </div>
      ) : (
        <div className="card p-6 text-center text-slate-600">No projects yet. Create your first one.</div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">New project</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 text-sm">Close</button>
            </div>
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="complete">Complete</option>
            </select>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
            <button
              className="btn btn-primary w-full"
              onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Creating...' : 'Create project'}
            </button>
            {mutation.isError && <p className="form-error">Could not create project</p>}
          </div>
        </div>
      )}
    </main>
  );
}

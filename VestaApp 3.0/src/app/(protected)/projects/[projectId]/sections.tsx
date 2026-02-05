'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StatusBadge from '@/components/status-badge';
import { useState } from 'react';

async function fetchProject(id: string) {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) throw new Error('Not found');
  return res.json().then((d) => d.project as any);
}

async function addRoom(projectId: string, data: any) {
  const res = await fetch(`/api/projects/${projectId}/rooms`, { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Create room failed');
  return res.json();
}

async function addTask(roomId: string, data: any) {
  const res = await fetch(`/api/rooms/${roomId}/tasks`, { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Create task failed');
  return res.json();
}

async function updateTask(taskId: string, data: any) {
  const res = await fetch(`/api/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Update task failed');
  return res.json();
}

export default function ProjectDetail({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const { data: project } = useQuery({ queryKey: ['project', projectId], queryFn: () => fetchProject(projectId) });
  const [roomName, setRoomName] = useState('');
  const [taskDrafts, setTaskDrafts] = useState<Record<string, string>>({});

  const addRoomMutation = useMutation({
    mutationFn: (data: any) => addRoom(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', projectId] });
      setRoomName('');
    }
  });

  const addTaskMutation = useMutation({
    mutationFn: ({ roomId, title }: { roomId: string; title: string }) => addTask(roomId, { title }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', projectId] })
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) => updateTask(taskId, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project', projectId] })
  });

  if (!project) return <main className="p-6">Loading...</main>;

  return (
    <main className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="text-slate-600">{project.description}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="card p-4 space-y-3">
        <h3 className="font-semibold">Add a room</h3>
        <div className="flex gap-2">
          <input
            placeholder="Room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={() => addRoomMutation.mutate({ name: roomName })}
            disabled={!roomName || addRoomMutation.isPending}
          >
            Add
          </button>
        </div>
        {addRoomMutation.isError && <p className="form-error">Could not add room</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {project.rooms.map((room: any) => (
          <div key={room.id} className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{room.name}</h3>
              <span className="text-xs text-slate-500">{room.tasks.length} tasks</span>
            </div>
            <div className="space-y-2">
              {room.tasks.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.status}</p>
                  </div>
                  <select
                    className="text-xs"
                    value={task.status}
                    onChange={(e) => updateTaskMutation.mutate({ taskId: task.id, status: e.target.value })}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                placeholder="New task"
                value={taskDrafts[room.id] || ''}
                onChange={(e) => setTaskDrafts((d) => ({ ...d, [room.id]: e.target.value }))}
              />
              <button
                className="btn btn-secondary"
                onClick={() => {
                  const title = taskDrafts[room.id];
                  if (!title) return;
                  addTaskMutation.mutate({ roomId: room.id, title });
                  setTaskDrafts((d) => ({ ...d, [room.id]: '' }));
                }}
              >
                Add Task
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

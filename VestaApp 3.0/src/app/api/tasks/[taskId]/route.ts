import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { taskSchema } from '@/lib/validation';

async function ensureTask(taskId: string, userId: string) {
  return prisma.task.findFirst({ where: { id: taskId, room: { project: { userId } } } });
}

export async function PATCH(req: Request, { params }: { params: { taskId: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await ensureTask(params.taskId, user.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const parsed = taskSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { dueDate, ...rest } = parsed.data;
  const task = await prisma.task.update({
    where: { id: params.taskId },
    data: { ...rest, dueDate: dueDate ? new Date(dueDate) : undefined }
  });
  return NextResponse.json({ task });
}

export async function DELETE(_req: Request, { params }: { params: { taskId: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await ensureTask(params.taskId, user.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.task.delete({ where: { id: params.taskId } });
  return NextResponse.json({ ok: true });
}

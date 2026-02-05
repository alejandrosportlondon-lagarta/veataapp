import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { taskSchema } from '@/lib/validation';

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const room = await prisma.room.findFirst({ where: { id: params.roomId, project: { userId: user.id } } });
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

  const body = await req.json();
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const taskCount = await prisma.task.count({ where: { roomId: room.id } });
  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      assignee: parsed.data.assignee,
      order: taskCount,
      roomId: room.id
    }
  });

  return NextResponse.json({ task }, { status: 201 });
}

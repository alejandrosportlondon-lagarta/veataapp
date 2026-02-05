import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { roomSchema } from '@/lib/validation';

async function ensureRoom(roomId: string, userId: string) {
  return prisma.room.findFirst({
    where: { id: roomId, project: { userId } }
  });
}

export async function PATCH(req: Request, { params }: { params: { roomId: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await ensureRoom(params.roomId, user.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const parsed = roomSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const room = await prisma.room.update({ where: { id: params.roomId }, data: parsed.data });
  return NextResponse.json({ room });
}

export async function DELETE(_req: Request, { params }: { params: { roomId: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await ensureRoom(params.roomId, user.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.task.deleteMany({ where: { roomId: params.roomId } });
  await prisma.room.delete({ where: { id: params.roomId } });

  return NextResponse.json({ ok: true });
}

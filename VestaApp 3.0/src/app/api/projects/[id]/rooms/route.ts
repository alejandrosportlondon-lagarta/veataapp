import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { roomSchema } from '@/lib/validation';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = roomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Ensure project belongs to user
  const project = await prisma.project.findFirst({ where: { id: params.id, userId: user.id } });
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const roomCount = await prisma.room.count({ where: { projectId: project.id } });

  const room = await prisma.room.create({
    data: { name: parsed.data.name, notes: parsed.data.notes, order: roomCount, projectId: project.id }
  });

  return NextResponse.json({ room }, { status: 201 });
}

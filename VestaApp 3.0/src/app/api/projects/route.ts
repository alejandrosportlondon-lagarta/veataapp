import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { projectSchema } from '@/lib/validation';

export async function GET() {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, description, status, dueDate } = parsed.data;
  const project = await prisma.project.create({
    data: {
      name,
      description: description || '',
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: user.id
    }
  });
  return NextResponse.json({ project }, { status: 201 });
}

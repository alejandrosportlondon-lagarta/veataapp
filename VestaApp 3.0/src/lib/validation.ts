import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Must include a letter and a number')
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  status: z.enum(['planning', 'active', 'complete']).default('planning'),
  dueDate: z.string().optional()
});

export const roomSchema = z.object({
  name: z.string().min(1),
  notes: z.string().optional()
});

export const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'done']).default('todo'),
  dueDate: z.string().optional(),
  assignee: z.string().optional()
});

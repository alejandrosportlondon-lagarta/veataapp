'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/validation';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const schema = registerSchema;
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const body = await res.json();
      setError(body.error || 'Registration failed');
      return;
    }
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="card w-full max-w-md p-6 space-y-4">
        <h1 className="text-xl font-semibold">Create account</h1>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="name">Name</label>
            <input id="name" {...register('name')} />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" {...register('email')} />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" type="password" {...register('password')} />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create account'}
          </button>
        </form>
      </div>
    </main>
  );
}

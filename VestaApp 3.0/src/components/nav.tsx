'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';

async function fetchMe() {
  const res = await fetch('/api/auth/me');
  if (res.status === 401) return null;
  return res.json().then((d) => d.user as { id: string; name: string; email: string } | null);
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
}

export default function Nav() {
  const router = useRouter();
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: fetchMe });
  const mutation = useMutation({ mutationFn: logout, onSuccess: () => router.push('/welcome') });

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <Link href="/dashboard" className="text-lg font-semibold text-accent">
        Vesta Tracker
      </Link>
      <div className="flex items-center gap-3 text-sm">
        {user && <span className="text-slate-700">Hi, {user.name}</span>}
        <button className="btn btn-secondary" onClick={() => mutation.mutate()}>
          Logout
        </button>
      </div>
    </header>
  );
}

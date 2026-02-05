import Link from 'next/link';

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-accent mb-4">Vesta</p>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Plan your decoration room by room.</h1>
        <p className="text-lg text-slate-600 mb-8">
          Create projects, break them into rooms, and track tasks to keep every detail on schedule.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/register" className="btn btn-primary">Create account</Link>
          <Link href="/login" className="btn btn-secondary">Login</Link>
        </div>
      </div>
    </main>
  );
}

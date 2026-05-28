'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Dumbbell, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: 'var(--color-bg-base)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div
          className="h-20 w-20 rounded-3xl flex items-center justify-center mx-auto"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-default)',
          }}
        >
          <Dumbbell className="h-10 w-10" style={{ color: 'var(--color-text-muted)' }} />
        </div>

        <div>
          <h1
            className="text-6xl font-black mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            404
          </h1>
          <p className="text-lg font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            Página não encontrada
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
            A rota que você tentou acessar não existe.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #5b0fc7 100%)',
            color: 'white',
            boxShadow: '0 4px 20px oklch(55% 0.28 290 / 0.3)',
          }}
        >
          <Home className="h-4 w-4" />
          Voltar ao início
        </Link>
      </motion.div>
    </main>
  );
}

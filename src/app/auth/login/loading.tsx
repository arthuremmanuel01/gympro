export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-base)' }}>
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center animate-pulse"
          style={{ background: 'var(--color-bg-elevated)' }}
        />
        <div className="skeleton h-3 w-24" />
      </div>
    </div>
  );
}

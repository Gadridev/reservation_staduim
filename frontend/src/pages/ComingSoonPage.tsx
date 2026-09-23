interface ComingSoonPageProps {
  title: string;
}

export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div className="mx-auto max-w-[600px] px-7 py-24 text-center">
      <p className="mb-2 font-mono text-xs tracking-[0.15em] text-turf">UPCOMING PHASE</p>
      <h1 className="font-display mb-3 text-3xl font-black uppercase tracking-wide text-ink">{title}</h1>
      <p className="text-sm text-ink-soft">
        This page hasn't been built yet — it'll arrive in a later phase of the frontend build.
      </p>
    </div>
  );
}

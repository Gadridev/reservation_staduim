interface StadiumHeaderProps {
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
}

export function StadiumHeader({
  name,
  address,
  rating,
  reviewCount,

}: StadiumHeaderProps) {
  return (
    <div className="mb-5">
      <h1 className="font-display mb-1 text-4xl font-black uppercase tracking-wide text-ink">{name}</h1>
      <p className="mb-4 text-sm text-ink-soft">
        📍 {address}
      </p>
      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-pitch-dark px-2.5 py-1 font-mono text-sm font-bold text-amber">
          {rating} ★
        </span>
        <span className="text-[13px] text-ink-soft">
          {reviewCount} reviews ·
        </span>
      </div>
    </div>
  );
}

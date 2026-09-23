export interface Stadium {
  id: string;
  name: string;
  rating: number;
  distance: number;
  pricePerHour: number;
  latitude: number;
  longitude: number;
}

interface StadiumCardProps {
  stadium: Stadium;
  isSelected: boolean;
  onClick: () => void;
}

export function StadiumCard({ stadium, isSelected, onClick }: StadiumCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-xl border p-3 text-left transition-all ${
        isSelected
          ? "border-emerald-600 bg-emerald-50 shadow-md"
          : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
      }`}
    >
      <div className="h-16 w-16 shrink-0 rounded-lg bg-emerald-700 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />

      <div className="flex-1">
        <h3 className="font-bold text-stone-900">{stadium.name}</h3>
        <div className="mt-1 flex items-center gap-3 text-xs text-stone-500">
          <span className="flex items-center gap-1 font-medium text-amber-500">
            ★ {stadium.rating}
          </span>
          <span>{stadium.distance} km</span>
        </div>
        <p className="mt-1 text-sm font-bold text-stone-900">
          {stadium.pricePerHour} DH / hr
        </p>
      </div>
    </button>
  );
}
interface MapPinProps {
  price: number;
  top: string;
  left: string;
  isActive: boolean;
  onClick: () => void;
}

export function MapPin({ price, top, left, isActive, onClick }: MapPinProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ top, left }}
      className="absolute z-10 flex -translate-x-1/2 -translate-y-full flex-col items-center"
    >
      <span
        className={`whitespace-nowrap rounded-full border-[1.5px] px-2.5 py-1.5 font-mono text-[11.5px] font-bold shadow-md transition-transform hover:scale-105 ${
          isActive
            ? "scale-110 border-amber bg-amber text-pitch-dark"
            : "border-pitch-dark bg-pitch-dark text-amber"
        }`}
      >
        {price} DH
      </span>
      <span className={`-mt-0.5 h-2.5 w-0.5 ${isActive ? "bg-amber" : "bg-pitch-dark"}`} />
      <span className={`h-2 w-2 rounded-full ${isActive ? "bg-amber" : "bg-pitch-dark"}`} />
    </button>
  );
}

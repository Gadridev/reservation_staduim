export function BookingProgress() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1f6f4a] text-xs font-bold text-white">
          1
        </div>

        <span className="text-sm font-semibold text-[#16231d]">
          Pick a slot
        </span>
      </div>

      <div className="h-[2px] w-28 bg-[#1f6f4a]" />

      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5a623] text-xs font-bold text-[#10251d]">
          2
        </div>

        <span className="text-sm font-semibold text-[#16231d]">
          Confirm
        </span>
      </div>
    </div>
  );
}
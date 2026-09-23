import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, id, className = "", ...rest },
  ref,
) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      <label
        htmlFor={selectId}
        className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-ink-soft"
      >
        {label}
      </label>
      <select
        id={selectId}
        ref={ref}
        className={`w-full border-none bg-transparent text-sm font-semibold text-ink outline-none ${className}`}
        {...rest}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
});

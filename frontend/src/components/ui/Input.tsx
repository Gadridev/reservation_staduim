import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, id, className = "", ...rest },
  ref,
) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-ink-soft"
      >
        {label}
      </label>
      <input
        id={inputId}
        ref={ref}
        className={`w-full border-none bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-ink-soft/50 ${className}`}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {error && <p className="mt-1 text-xs font-medium text-danger">{error}</p>}
    </div>
  );
});

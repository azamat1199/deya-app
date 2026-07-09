import type { FieldValues, Path, UseFormRegister } from "react-hook-form";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface CheckboxProps<TFormValues extends FieldValues> {
  /** May contain inline links (e.g. to the privacy policy). Since this
   * whole label toggles the checkbox on click, any nested <Link>/<a> must
   * call `event.stopPropagation()` in its own onClick so it navigates
   * instead of just toggling the box. */
  label: ReactNode;
  name: Path<TFormValues>;
  required?: boolean;
  error?: string;
  register: UseFormRegister<TFormValues>;
  className?: string;
}

const REQUIRED_MESSAGE = "Это поле обязательно для заполнения";

export default function Checkbox<TFormValues extends FieldValues>({
  label,
  name,
  required = false,
  error,
  register,
  className,
}: CheckboxProps<TFormValues>) {
  return (
    <div className={className}>
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="peer sr-only"
          aria-invalid={Boolean(error)}
          {...register(name, { required: required ? REQUIRED_MESSAGE : false })}
        />
        {/* Checkmark is white on a white/transparent box, so it's naturally
            invisible until peer-checked turns the box brand red for contrast —
            avoids relying on peer-checked for a non-sibling descendant, which
            Tailwind's `~` combinator can't target. */}
        <span
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors duration-200 ease-in-out",
            "peer-checked:border-brand-600 peer-checked:bg-brand-600",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2",
            error ? "border-brand-600" : "border-line-300",
          )}
          aria-hidden="true"
        >
          <svg viewBox="0 0 16 16" className="h-3 w-3 text-white">
            <path
              d="M3 8.5 6.5 12l6.5-7"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="text-sm text-ink-700">{label}</span>
      </label>

      {error && <p className="mt-1.5 text-sm text-brand-600">{error}</p>}
    </div>
  );
}
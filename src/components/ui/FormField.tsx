import type { FieldValues, Path, RegisterOptions, UseFormRegister } from "react-hook-form";

import { cn } from "@/lib/cn";

export type FormFieldType = "text" | "email" | "tel" | "textarea";

export interface FormFieldProps<TFormValues extends FieldValues> {
  label: string;
  name: Path<TFormValues>;
  type?: FormFieldType;
  required?: boolean;
  /** react-hook-form validation messages. Passed in by the caller (which
   *  already holds t() via useTranslation()) rather than hardcoded here —
   *  this component is generic and locale-agnostic. */
  requiredMessage?: string;
  emailInvalidMessage?: string;
  placeholder?: string;
  error?: string;
  register: UseFormRegister<TFormValues>;
  className?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildRegisterOptions<TFormValues extends FieldValues>(
  type: FormFieldType,
  required: boolean,
  requiredMessage: string | undefined,
  emailInvalidMessage: string | undefined,
): RegisterOptions<TFormValues, Path<TFormValues>> {
  const options: RegisterOptions<TFormValues, Path<TFormValues>> = {
    required: required ? (requiredMessage ?? true) : false,
  };
  if (type === "email") {
    options.pattern = {
      value: EMAIL_PATTERN,
      message: emailInvalidMessage ?? "",
    };
  }
  return options;
}

const INPUT_BASE_CLASSES =
  "w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition-colors duration-200 ease-in-out placeholder:text-ink-500 focus:border-ink-900 focus:ring-1 focus:ring-ink-900";

export default function FormField<TFormValues extends FieldValues>({
  label,
  name,
  type = "text",
  required = false,
  requiredMessage,
  emailInvalidMessage,
  placeholder,
  error,
  register,
  className,
}: FormFieldProps<TFormValues>) {
  const registerOptions = buildRegisterOptions<TFormValues>(
    type,
    required,
    requiredMessage,
    emailInvalidMessage,
  );
  const borderClass = error ? "border-brand-600" : "border-line-200";

  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-ink-900">
        {label}
        {required && (
          <span className="ml-0.5 text-brand-600" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {type === "textarea" ? (
        <textarea
          rows={4}
          placeholder={placeholder}
          className={cn(INPUT_BASE_CLASSES, borderClass, "resize-none")}
          aria-invalid={Boolean(error)}
          {...register(name, registerOptions)}
        />
      ) : type === "tel" ? (
        <div
          className={cn(
            "flex items-center rounded-md border bg-white transition-colors duration-200 ease-in-out focus-within:border-ink-900 focus-within:ring-1 focus-within:ring-ink-900",
            borderClass,
          )}
        >
          <span className="shrink-0 border-r border-line-200 px-3.5 py-2.5 text-sm text-ink-700">
            🇺🇿 +998
          </span>
          <input
            type="tel"
            placeholder={placeholder}
            className="w-full bg-transparent px-3.5 py-2.5 text-sm text-ink-900 outline-none placeholder:text-ink-500"
            aria-invalid={Boolean(error)}
            {...register(name, registerOptions)}
          />
        </div>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          className={cn(INPUT_BASE_CLASSES, borderClass)}
          aria-invalid={Boolean(error)}
          {...register(name, registerOptions)}
        />
      )}

      {error && <p className="mt-1.5 text-sm text-brand-600">{error}</p>}
    </div>
  );
}
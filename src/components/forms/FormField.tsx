import React from "react";

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
  value: string;
  placeholder?: string;
  error?: string;
  helpText?: string;
  autoComplete?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  rows?: number;
}

export function FormField({
  id,
  name,
  label,
  type = "text",
  required = false,
  optional = false,
  value,
  placeholder,
  error,
  helpText,
  autoComplete,
  onChange,
  rows,
}: FormFieldProps) {
  const isTextarea = type === "textarea";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-xs font-medium uppercase tracking-wider text-brand-graphite"
        >
          {label}{" "}
          {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
        {optional && (
          <span className="text-[11px] font-light text-brand-silver">
            Optional
          </span>
        )}
      </div>

      {isTextarea ? (
        <textarea
          id={id}
          name={name}
          rows={rows || 4}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          className={`w-full px-3.5 py-2.5 rounded-sm border text-sm font-light text-brand-graphite placeholder:text-brand-silver/50 focus:outline-none focus:ring-1 transition-colors resize-y ${
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20"
              : "border-brand-edge focus:border-brand-electric focus:ring-brand-electric bg-white"
          }`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          className={`w-full px-3.5 py-2.5 rounded-sm border text-sm font-light text-brand-graphite placeholder:text-brand-silver/50 focus:outline-none focus:ring-1 transition-colors ${
            error
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20"
              : "border-brand-edge focus:border-brand-electric focus:ring-brand-electric bg-white"
          }`}
        />
      )}

      {helpText && !error && (
        <p id={`${id}-help`} className="text-xs text-brand-silver font-light">
          {helpText}
        </p>
      )}

      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-rose-600 font-normal">
          {error}
        </p>
      )}
    </div>
  );
}

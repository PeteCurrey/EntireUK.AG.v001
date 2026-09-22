import React from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  value: string;
  options: Option[];
  error?: string;
  helpText?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function SelectField({
  id,
  name,
  label,
  required = false,
  optional = false,
  value,
  options,
  error,
  helpText,
  onChange,
}: SelectFieldProps) {
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

      <select
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
        className={`w-full px-3.5 py-2.5 rounded-sm border text-sm font-light text-brand-graphite bg-white focus:outline-none focus:ring-1 transition-colors ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500 bg-rose-50/20"
            : "border-brand-edge focus:border-brand-electric focus:ring-brand-electric"
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

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

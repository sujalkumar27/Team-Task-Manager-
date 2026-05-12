"use client";
import { SelectHTMLAttributes, forwardRef } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, className = "", children, ...rest },
  ref
) {
  return (
    <select
      ref={ref}
      className={`block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 ${
        invalid
          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
          : "border-slate-300"
      } ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
});

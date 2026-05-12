"use client";
import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className = "", ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 ${
        invalid
          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
          : "border-slate-300"
      } ${className}`}
      {...rest}
    />
  );
});

"use client";
import { TextareaHTMLAttributes, forwardRef } from "react";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ invalid, className = "", ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 ${
          invalid
            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
            : "border-slate-300"
        } ${className}`}
        {...rest}
      />
    );
  }
);

import { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-white placeholder-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:outline-none focus:border-[#F5B942]/70 focus:bg-white/[0.07] focus:ring-4 focus:ring-[#F5B942]/15 transition-all duration-300 ${className}`}
      {...rest}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      className={`w-full px-4 py-3 rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-white placeholder-gray-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] focus:outline-none focus:border-[#F5B942]/70 focus:bg-white/[0.07] focus:ring-4 focus:ring-[#F5B942]/15 transition-all duration-300 ${className}`}
      {...rest}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return (
    <select
      className={`w-full px-4 py-3 rounded-xl bg-[#141419]/90 backdrop-blur-xl border border-white/10 text-white focus:outline-none focus:border-[#F5B942]/70 focus:ring-4 focus:ring-[#F5B942]/15 transition-all duration-300 ${className}`}
      {...rest}
    />
  );
}

export function Label({
  htmlFor,
  children,
  className = "",
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-300 mb-2 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}

export function FormGroup({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

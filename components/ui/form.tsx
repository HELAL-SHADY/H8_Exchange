import { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full px-4 py-3 rounded-lg bg-[#2D2D2D] border border-[#3D3D3D] text-white placeholder-gray-500 focus:outline-none focus:border-[#F5B942] transition-colors duration-300"
      {...props}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="w-full px-4 py-3 rounded-lg bg-[#2D2D2D] border border-[#3D3D3D] text-white placeholder-gray-500 focus:outline-none focus:border-[#F5B942] transition-colors duration-300"
      {...props}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="w-full px-4 py-3 rounded-lg bg-[#2D2D2D] border border-[#3D3D3D] text-white focus:outline-none focus:border-[#F5B942] transition-colors duration-300"
      {...props}
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

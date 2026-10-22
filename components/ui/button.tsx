export function Button({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 overflow-hidden active:scale-[0.98] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      className={`bg-gradient-to-r from-[#F5B942] via-[#F8C65D] to-[#E6A430] text-[#0A0A0A] font-bold shadow-[0_4px_25px_rgba(245,185,66,0.35),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:shadow-[0_6px_35px_rgba(245,185,66,0.6),inset_0_1px_2px_rgba(255,255,255,0.8)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {/* Specular Top Sheen */}
      <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </Button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      className={`liquid-pill text-white hover:text-[#F5B942] hover:border-[#F5B942]/60 hover:bg-white/[0.08] hover:shadow-[0_0_25px_rgba(245,185,66,0.2)] ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </Button>
  );
}

export function DangerButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      className={`bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-[0_4px_20px_rgba(239,68,68,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_6px_30px_rgba(239,68,68,0.55)] hover:scale-[1.02] ${className}`}
      {...props}
    >
      <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </Button>
  );
}

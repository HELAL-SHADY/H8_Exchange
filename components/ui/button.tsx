export function Button({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      style={{ backgroundColor: "#F5B942" }}
      className="text-[#0A0A0A] hover:bg-[#E6A430] hover:shadow-lg hover:shadow-[#F5B942]/50 disabled:opacity-50 disabled:cursor-not-allowed"
      {...props}
    >
      {children}
    </Button>
  );
}

export function SecondaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      className="bg-[#1A1A1A] text-white border border-[#F5B942] hover:bg-[#F5B942] hover:text-[#0A0A0A] transition-all duration-300"
      {...props}
    >
      {children}
    </Button>
  );
}

export function DangerButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      className="bg-red-600 hover:bg-red-700 text-white"
      {...props}
    >
      {children}
    </Button>
  );
}
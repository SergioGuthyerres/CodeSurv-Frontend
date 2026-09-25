import type { ButtonHTMLAttributes } from "react";

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tamanho?: "sm" | "md" | "lg";
}

export default function PixelButton({
  children,
  tamanho = "md",
  className = "",
  ...props
}: PixelButtonProps) {
  const classesTamanho = {
    sm: "px-6 py-2 text-xl",
    md: "px-10 py-3 text-2xl md:text-3xl",
    lg: "px-16 py-4 text-3xl md:text-4xl",
  };

  return (
    <button
      className={`
        relative group bg-[#9ca3af] text-black font-pixel font-bold uppercase tracking-widest
        border-4 border-black rounded-xl
        transition-transform active:translate-y-1 active:bg-[#888e99]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0
        ${classesTamanho[tamanho]}
        ${className}
      `}
      {...props}
    >
      {/* Camada 1: O brilho - Agora com rounded-xl para acompanhar a curva */}
      <div className="absolute inset-0 rounded-xl border-t-4 border-l-4 border-white/70 pointer-events-none group-active:border-t-transparent group-active:border-l-transparent"></div>

      {/* Camada 2: A sombra - Agora com rounded-xl para acompanhar a curva */}
      <div className="absolute inset-0 rounded-xl border-b-4 border-r-4 border-black/30 pointer-events-none group-active:border-b-transparent group-active:border-r-transparent"></div>

      <span className="relative z-10">{children}</span>
    </button>
  );
}

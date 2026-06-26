"use client";

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function PremiumCard({ children, className = "", hover = true }: PremiumCardProps) {
  return (
    <div
      className={`rounded-2xl transition-all duration-300 ${
        hover ? "hover:scale-[1.02] hover:shadow-xl" : ""
      } ${className}`}
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        padding: "1.5rem",
      }}
    >
      {children}
    </div>
  );
}
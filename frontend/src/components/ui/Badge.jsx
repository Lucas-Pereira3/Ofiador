import React from "react";

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-[#108243]/10 text-[#108243]",
    warning: "bg-[#CFC01A]/10 text-[#CFC01A]",
    danger: "bg-[#D92B14]/10 text-[#D92B14]",
    info: "bg-blue-500/10 text-blue-600",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;

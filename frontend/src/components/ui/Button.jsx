import React from "react";

const Button = React.forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      icon: Icon,
      iconPosition = "left",
      className = "",
      disabled,
      type = "button",
      onClick,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-[#1A2B4C] text-white hover:bg-[#152340] focus:ring-[#1A2B4C] shadow-sm hover:shadow-md",
      secondary:
        "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400",
      outline:
        "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400",
      danger: "bg-[#D92B14] text-white hover:bg-red-700 focus:ring-[#D92B14]",
      success:
        "bg-[#108243] text-white hover:bg-green-700 focus:ring-[#108243]",
      ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2.5 text-sm",
      lg: "px-5 py-3 text-base",
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <button
        ref={ref}
        type={type}
        className={combinedClassName}
        disabled={disabled || isLoading}
        onClick={onClick}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {Icon && iconPosition === "left" && !isLoading && (
          <Icon className="h-4 w-4" />
        )}
        {children}
        {Icon && iconPosition === "right" && <Icon className="h-4 w-4" />}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

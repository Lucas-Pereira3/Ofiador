import React from "react";

const Select = React.forwardRef(
  (
    {
      label,
      error,
      required,
      options = [],
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-[#D92B14] ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1A2B4C]/20 focus:border-[#1A2B4C] transition-all duration-200 ${
            error
              ? "border-[#D92B14] focus:ring-[#D92B14]/20 focus:border-[#D92B14]"
              : "border-gray-200"
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-[#D92B14]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;

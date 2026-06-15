import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`flex w-full font-sans text-sm bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

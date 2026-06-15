import * as React from "react";

type ButtonVariant = "default" | "outline" | "ghost";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const base =
  "inline-flex items-center justify-center font-sans text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";

const variantStyles: Record<ButtonVariant, string> = {
  default: "",
  outline: "",
  ghost: ""
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${base} ${variantStyles[variant]} ${className}`.trim()}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

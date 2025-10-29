import { forwardRef, useRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes, Ref } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const inputVariants = cva(
  "w-full rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-slate-300 focus:ring-indigo-500",
        outline: "border-2 border-slate-200 focus:ring-purple-500",
        ghost: "border-transparent bg-transparent focus:ring-indigo-400",
      },
      size: {
        sm: "h-8 px-2 text-sm",
        md: "h-10 px-3 text-base",
        lg: "h-12 px-4 text-lg",
        textarea: "min-h-[140px] px-4 py-2 resize-none text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  icon?: React.ReactNode;
  fileLabel?: string;
}

export const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(({ className, variant, size = "md", icon, fileLabel, ...props }, ref) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isFile = props.type === "file";

  const inputClass = twMerge(inputVariants({ variant, size }), className);

  if (isFile) {
    const fileButtonSizeClasses = {
      sm: "h-8 px-2 text-sm leading-none",
      md: "h-10 px-3 text-base leading-none",
      lg: "h-12 px-4 text-lg leading-none",
    };

    const validFileButtonSizes = ["sm", "md", "lg"] as const;

    return (
      <div className="w-full space-y-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={twMerge(
            "w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-md shadow hover:opacity-90 transition-all cursor-pointer",
            validFileButtonSizes.includes(size as any)
              ? fileButtonSizeClasses[size as "sm" | "md" | "lg"]
              : fileButtonSizeClasses.md
          )}
        >
          {icon && <span className="text-white">{icon}</span>}
          {fileLabel || "Choose File"}
        </button>

        <input
          ref={(el) => {
            fileInputRef.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) (ref as any).current = el;
          }}
          type="file"
          className="hidden"
          {...props}
        />

        {fileInputRef.current?.files?.[0] && (
          <div className="text-sm text-slate-300 text-center truncate">
            Selected:{" "}
            <span className="font-medium">
              {fileInputRef.current.files[0].name}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        ref={ref as Ref<HTMLInputElement>}
        className={twMerge(inputClass, icon && "pl-10")}
        {...props}
      />
    </div>
  );
});

Input.displayName = "Input";

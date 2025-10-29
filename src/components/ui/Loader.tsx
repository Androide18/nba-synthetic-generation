import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Icon } from "./Icon";

const colors = {
  primary: "text-slate-800",
  secondary: "text-white",
  info: "text-gray-300",
  danger: "text-red-600",
  success: "text-green-600",
};

const sizes = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

const containerStyle = cva(
  "animate-[fade-in_1s_2s_ease-out_forwards] opacity-1",
  {
    variants: {
      color: colors,
      size: sizes,
    },
  }
);

const loaderStyle = cva("animate-spin", {
  variants: {
    color: colors,
    size: sizes,
  },
});

interface LoaderProps {
  size?: keyof typeof sizes;
  color?: keyof typeof colors;
  className?: string;
}

export const Loader = (props: LoaderProps) => {
  const { className, color, size } = props;

  return (
    <div
      className={twMerge(
        containerStyle({ color: color || "primary" }),
        className
      )}
    >
      <Icon
        name="Loader"
        iconProps={{
          className: twMerge(
            loaderStyle({ color: color || "primary", size: size || "sm" }),
            className
          ),
        }}
      />
    </div>
  );
};

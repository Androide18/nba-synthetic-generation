import * as ReactFeather from 'react-feather';
import {cva} from 'class-variance-authority';
import {twMerge} from 'tailwind-merge';

const sizes = {
  xsm: 'w-5 h-5',
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-20 h-20',
};

const colors = {
  primary: 'text-slate-800',
  secondary: 'text-white',
  info: 'text-slate-400',
  danger: 'text-red-600',
  success: 'text-green-600',
};

const iconStyles = cva('', {
  variants: {
    size: sizes,
    color: colors,
  },
});

interface IconProps {
  name: keyof typeof ReactFeather;
  size?: keyof typeof sizes;
  color?: keyof typeof colors;
  children?: React.ReactNode;
  className?: string;
  iconProps?: ReactFeather.IconProps;
}

export const Icon = (props: IconProps) => {
  const {
    name,
    size = 'md',
    color = 'primary',
    children,
    className,
    iconProps,
  } = props;

  const iconClasses = twMerge(
    iconStyles({
      size,
      color,
    }),
    className,
  );

  const Icon = ReactFeather[name];
  return (
    <Icon className={iconClasses} {...iconProps}>
      {children}
    </Icon>
  );
};
import clsx from "clsx";
import Link from "next/link";
import { ButtonHTMLAttributes, Fragment, PropsWithChildren } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  outlined?: boolean;
  sm?: boolean;
  xs?: boolean;
  xxs?: boolean;
  href?: string;
  isLoading?: boolean;
  target?: string;
};

const withLink = (href: string, target?: string) => {
  const EL: React.FC<PropsWithChildren> = ({ children }) => {
    return (
      <Link target={target} href={href}>
        {children}
      </Link>
    );
  };
  return EL;
};

const Button: React.FC<Props> = ({
  children,
  className,
  type,
  outlined,
  href,
  target,
  sm,
  xs,
  xxs,
  isLoading,
  disabled,
  ...props
}) => {
  const Container = href ? withLink(href, target) : Fragment;

  return (
    <Container>
      <button
        disabled={disabled || isLoading}
        type={type || "button"}
        {...props}
        className={clsx(
          className,
          "border-primary border-2 text-white uppercase font-bold hover:-translate-y-0.5 transition-transform",
          outlined ? "border-primary" : "bg-primary",
          xxs ? "px-2 py-1.5 text-sm" : xs ? "px-4 py-2" : sm ? "px-6 py-3" : "px-8 py-3",
          "disabled:brightness-75 disabled:cursor-not-allowed"
        )}
      >
        {children} {isLoading && <span className="ml-1">...</span>}
      </button>
    </Container>
  );
};

export default Button;

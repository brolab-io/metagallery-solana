import { Transition } from "@headlessui/react";

type Props = {
  label?: string;
  isLoading: boolean;
};

const LoadingOverlay = ({ label = "Loading...", isLoading }: Props) => {
  return (
    <Transition
      as="div"
      show={isLoading}
      enter="transition-all"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-all"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className="absolute inset-0 flex items-center justify-center bg-black/70"
    >
      {/* Loading svg */}
      <svg
        className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v1a7 7 0 00-7 7h1z"
        ></path>
      </svg>
      <span className="text-white">{label}</span>
    </Transition>
  );
};

export default LoadingOverlay;

import { FC } from "react";

export const Loader: FC = () => {
  return (
    <span className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin">
      Loading...
    </span>
  );
};

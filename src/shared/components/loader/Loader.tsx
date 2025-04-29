import { FC } from "react";

export const Loader: FC = () => {
  return (
    <span className="w-10 h-10 border-4 text-center text-2xl leading-10 border-gray-100 border-t-blue-500 rounded-full animate-spin p-4"></span>
  );
};

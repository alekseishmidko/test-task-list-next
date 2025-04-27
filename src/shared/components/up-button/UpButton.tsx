import type { FC } from "react";

type Props = { text: string; onClick: () => void };

export const UpButton: FC<Props> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all cursor-pointer"
      aria-label="Scroll to top"
    >
      {text}
    </button>
  );
};

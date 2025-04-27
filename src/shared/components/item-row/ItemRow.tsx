"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ItemRowProps {
  id: number;
  selected: boolean;
  onToggle: (id: number) => void;
}

export function ItemRow({ id, selected, onToggle }: ItemRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="flex items-center justify-between border p-2 bg-white rounded shadow-sm hover:bg-gray-50 cursor-grab"
    >
      <div className="flex items-center gap-2">
        <input
          className="w-6 h-6 cursor-pointer"
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(id)}
        />
        <span>{id}</span>
      </div>
      <span className="text-gray-400 text-2xl cursor-grab">⋮⋮</span>
    </div>
  );
}

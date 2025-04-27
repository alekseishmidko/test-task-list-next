"use client";
import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  useSensors,
  useSensor,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ApiService } from "@/shared/api/services";
import { ItemRow } from "@/shared/components/item-row/ItemRow";
import { useInfiniteScroll } from "@/shared/hooks/useInfinityScroll";
import { Loader } from "@/shared/components/loader/Loader";
import { useScrollToTop } from "@/shared/hooks/useScrollToTop";
import { UpButton } from "@/shared/components/up-button/UpButton";

const LIMIT = 20;

type Item = { id: number; isSelected: boolean };

export default function Page() {
  const [search, setSearch] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  console.log(isSearching);
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ["items", search],
      queryFn: ({ pageParam = 0 }) =>
        ApiService.fetchItems(search, pageParam, LIMIT),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.items.length < LIMIT) {
          return undefined;
        }
        return allPages.length * LIMIT;
      },
    });

  const orderMutation = useMutation({
    mutationFn: ApiService.updateOrder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });

  const selectMutation = useMutation({
    mutationFn: ApiService.updateSelection,
  });

  useEffect(() => {
    if (search === "") return; // если поле пустое, ничего не делать

    setIsSearching(true);

    const delayDebounce = setTimeout(() => {
      refetch().finally(() => setIsSearching(false));
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [refetch, search]);

  useEffect(() => {
    if (data?.pages) {
      const newItems = data.pages.flatMap((p) => p.items);
      setItems(newItems);
    }
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);
      setItems(newOrder);
      orderMutation.mutate(newOrder.map((item) => item.id));
    }
  };

  const toggleSelect = (id: number) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, isSelected: !item.isSelected } : item
    );
    setItems(updatedItems);

    const toggledItem = updatedItems.find((item) => item.id === id);
    if (toggledItem) {
      selectMutation.mutate([{ id, selected: toggledItem.isSelected }]);
    }
  };

  const loadMoreRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
  });
  const { isVisible, scrollToTop } = useScrollToTop(300);
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className="border p-2 w-full mb-4"
        placeholder="Enter number from 1 to 1,000,000"
        value={search}
        onChange={(e) => {
          const value = e.target.value;
          const numericValue = value.replace(/\D/g, "");

          if (
            numericValue === "" ||
            (Number(numericValue) >= 1 && Number(numericValue) <= 1_000_000)
          ) {
            setSearch(numericValue);
            setIsSearching(true);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            refetch().finally(() => setIsSearching(false));
          }
        }}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <ItemRow
                key={item.id}
                id={item.id}
                selected={item.isSelected}
                onToggle={toggleSelect}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div ref={loadMoreRef} className="h-8" />
      {isVisible && <UpButton text="Up" onClick={scrollToTop} />}

      {(isFetchingNextPage || isSearching) && <Loader />}
    </div>
  );
}

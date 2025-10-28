"use client";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface FilterCarouselProps {
  isLoading?: boolean;
  data?: { value: string; label: string }[];
}

export function FilterCarousel({ isLoading, data }: FilterCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const onSelectItem = (val: string | null) => {
    setSelectedValue(val);
  };

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    const onSelectEvent = () => setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", onSelectEvent);
    return () => {
      api.off("select", onSelectEvent);
    };
  }, [api]);

  return (
    <div className="relative w-full">
      <div
        className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none"/>

      <Carousel
        setApi={setApi}
        opts={{ align: "start", dragFree: true }}
        className="w-full px-12"
      >
        <CarouselContent className="-ml-3">
          {isLoading &&
           Array.from({ length: 14 }).map((_, index) => (
             <CarouselItem key={index} className="pl-3 basis-auto">
               <Skeleton className="rounded-lg px-3 py-1 h-full text-sm w-[100px] font-semibold"/>
             </CarouselItem>
           ))}

          {!isLoading && (
            <CarouselItem
              className="pl-3 basis-auto"
              onClick={() => onSelectItem(null)}
            >
              <Badge
                variant={selectedValue === null ? "default" : "secondary"}
                className="rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm"
              >
                全部
              </Badge>
            </CarouselItem>
          )}

          {!isLoading &&
           data?.map((item) => (
             <CarouselItem
               key={item.value}
               className="pl-3 basis-auto"
               onClick={() => onSelectItem(item.value)}
             >
               <Badge
                 variant={
                   selectedValue === item.value ? "default" : "secondary"
                 }
                 className="rounded-md px-3 py-1 cursor-pointer whitespace-nowrap text-sm"
               >
                 {item.label}
               </Badge>
             </CarouselItem>
           ))}
        </CarouselContent>

        <CarouselPrevious className="left-0 cursor-pointer hover:bg-foreground/40 w-8 h-8 z-20"/>
        <CarouselNext className="right-0 cursor-pointer hover:bg-foreground/40 w-8 h-8 z-20"/>
      </Carousel>

      <div
        className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none"/>
    </div>
  );
}
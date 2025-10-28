'use client'

import { SmartImage } from "@/components/smart-image";
import { useRouter } from "next/navigation";
import { VideoData } from "@/actions/video/get-videos";
import { formatRelativeTime } from "@/lib/time";
import { Skeleton } from "@/components/ui/skeleton";

export function ShortVideoCard({ data }: { data?: VideoData | undefined }) {
  const router = useRouter();
  if (!data) return (
    <div className="flex-1">
      <Skeleton className="w-full aspect-[2/3] rounded-xl"/>
      <div className="w-full mt-2 space-y-2">
        <Skeleton className="h-5 w-full"/>
        <Skeleton className="h-4 w-3/4"/>
      </div>
    </div>
  );

  return (
    <div className="flex-1 cursor-pointer" onClick={() => router.push(`/watch/${data.shortCode}`)}>
      <div className="w-full aspect-[2/3] rounded-xl overflow-hidden">
        <SmartImage src={data.thumbnail} alt=""/>
      </div>

      <div className="w-full mt-2">
        <p className="font-bold">{data.title}</p>
        <p className="text-sm text-muted-foreground">
          {(() => {
            const views = Number(data.views);
            if (views >= 10000) {
              const display = (views / 10000).toFixed(1).replace('.0', '');
              return `${display}万 次观看 · ${formatRelativeTime(data.createdAt)}`;
            }
            return `${views} 次观看 · ${formatRelativeTime(data.createdAt)}`;
          })()}
        </p>
      </div>
    </div>
  )
}
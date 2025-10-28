'use client'

import { useEffect, useState } from "react";
import { FilterCarousel } from "@/components/filter-carousel";
import { RecommendVideo } from "@/modules/play/recommend-video";
import { getRecommendation, VideoData } from "@/actions/video/get-recommendation";

export function RecommendationList({ categories }: { categories: { id: string; name: string }[] }) {
  const [recommendVideos, setRecommendVideos] = useState<VideoData[]>();

  const carouselData = categories.map((c) => ({
    value: c.id,
    label: c.name
  }));

  useEffect(() => {
    (async () => {
      const videos = await getRecommendation();
      setRecommendVideos(videos);
    })()
  }, [])

  return (
    <div className="w-100 grow space-y-4">
      <div className="w-full p-2">
        <FilterCarousel data={carouselData}/>
      </div>
      {recommendVideos?.map((v) => (
        <RecommendVideo key={v.id} data={v}/>
      ))}
    </div>
  );
}
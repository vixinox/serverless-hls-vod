'use client'

import { VideoCard } from "@/modules/home/video-card";
import { ShortVideoCard } from "@/modules/home/short-video-card";
import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";
import { getVideos, VideoData } from "@/actions/video/get-videos";

function useResponsiveCols(breakpoints: { width: number, cols: number }[]) {
  const [cols, setCols] = useState(breakpoints[0].cols);

  useEffect(() => {
    function updateCols() {
      const w = window.innerWidth;
      let matched = breakpoints[0].cols;
      for (const bp of breakpoints) {
        if (w >= bp.width) matched = bp.cols;
      }
      setCols(matched);
    }

    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, [breakpoints]);
  return cols;
}

export function HomeVideoList() {
  const colsNormal = useResponsiveCols([
    { width: 0, cols: 1 },
    { width: 1080, cols: 2 },
    { width: 1440, cols: 3 },
    { width: 2560, cols: 4 }
  ]);
  const colsShort = useResponsiveCols([
    { width: 0, cols: 2 },
    { width: 1080, cols: 3 },
    { width: 1440, cols: 5 },
    { width: 2560, cols: 6 }
  ]);

  const [videos, setVideos] = useState<(VideoData | undefined)[]>(() =>
    new Array(12).fill(undefined)
  );
  const [shorts, setShorts] = useState<(VideoData | undefined)[]>(() =>
    new Array(12).fill(undefined)
  );

  useEffect(() => {
    (async () => {
      const { long, short } = await getVideos();
      setVideos(long);
      setShorts(short);
    })()
  }, []);

  const firstNormalRow = videos.slice(0, colsNormal);
  const thirdNormalRow = videos.slice(colsNormal, colsNormal * 2);
  const remainingNormal = videos.slice(colsNormal * 2);
  const firstShortRow = shorts.slice(0, colsShort);
  const secondShortRow = shorts.slice(colsShort, colsShort * 2);

  return (
    <div className="w-full">
      <div className="grid mt-10 px-2 gap-4"
           style={{ gridTemplateColumns: `repeat(${colsNormal}, 1fr)` }}
      >
        {firstNormalRow.map((v, i) => (
          <VideoCard key={`normal-first-${i}`} data={v}/>
        ))}
      </div>

      <div className="w-full flex pl-4 mt-16 items-center">
        <Smartphone className="text-red-500"/>
        <p className="font-bold text-xl ml-2">Shorts</p>
      </div>

      <div className="grid mt-10 px-2 gap-4"
           style={{ gridTemplateColumns: `repeat(${colsShort}, 1fr)` }}
      >
        {firstShortRow.map((v, i) => (
          <ShortVideoCard key={`short-first-${i}`} data={v}/>
        ))}
      </div>

      <div className="grid mt-16 px-2 gap-4"
           style={{ gridTemplateColumns: `repeat(${colsNormal}, 1fr)` }}
      >
        {thirdNormalRow.map((v, i) => (
          <VideoCard key={`normal-second-${i}`} data={v}/>
        ))}
      </div>

      <div className="w-full flex pl-4 mt-16 items-center">
        <Smartphone className="text-red-500"/>
        <p className="font-bold text-xl ml-2">Shorts</p>
      </div>

      <div className="grid mt-16 px-2 gap-4"
           style={{ gridTemplateColumns: `repeat(${colsShort}, 1fr)` }}
      >
        {secondShortRow.map((v, i) => (
          <ShortVideoCard key={`short-second-${i}`} data={v}/>
        ))}
      </div>

      {remainingNormal.length > 0 && (
        <div className="grid mt-16 px-2 gap-4"
             style={{ gridTemplateColumns: `repeat(${colsNormal}, 1fr)` }}
        >
          {remainingNormal.map((v, i) => (
            <VideoCard key={`normal-remaining-${i}`} data={v}/>
          ))}
        </div>
      )}
    </div>
  )
}
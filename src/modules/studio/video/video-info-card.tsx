import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HlsVideoPlayer } from "@/modules/play/hls-video-player";

interface VideoInfoCardProps {
  filename: string;
  shortCode: string;
  thumbnail: string | null;
  domain: string;
}

export function VideoInfoCard({ filename, shortCode, thumbnail, domain }: VideoInfoCardProps) {
  const presets = ["1080p", "720p", "360p"];
  const videoUrl = `http://localhost:3000/watch/${shortCode}`;

  return (
    <Card className="p-0 overflow-hidden gap-0">
      <CardContent className="w-full aspect-video p-0 overflow-hidden">
        <HlsVideoPlayer shortCode={shortCode} thumbnail={thumbnail} domain={domain}/>
      </CardContent>
      <div className="p-4 flex justify-between items-center">
        <div className="w-[90%]">
          <p className="text-xs text-muted-foreground">视频链接</p>
          <Link
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline text-sm break-all whitespace-normal"
          >
            {videoUrl}
          </Link>
        </div>
        <CopyButton title="复制视频链接" content={videoUrl}/>
      </div>

      <div className="px-4 pb-4 flex justify-start items-center">
        <div>
          <p className="text-xs text-muted-foreground">文件名</p>
          <p className="text-sm">{filename}</p>
        </div>
      </div>

      <div className="px-4 pb-4 flex justify-start items-center">
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">视频画质</p>
          <div className="flex gap-2">
            {presets.map((name, index) => (
              <Badge key={index}>{name}</Badge>
            ))}
          </div>
        </div>
      </div>

    </Card>
  )
}
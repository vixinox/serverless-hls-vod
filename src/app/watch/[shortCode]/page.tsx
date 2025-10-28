import VideoInfo from "@/modules/play/video-info";
import { getVideoInfo } from "@/actions/video/get-video-info";
import { CommentArea } from "@/modules/play/comment-area";
import { HlsVideoPlayer } from "@/modules/play/hls-video-player";
import { RecommendationList } from "@/modules/play/recommendation-list";
import { getCategories } from "@/actions/video/get-categories";

export default async function VideoPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const { shortCode } = await params;
  const { videoData, channelData } = await getVideoInfo(shortCode);
  const categories = await getCategories();
  const domain = process.env.VIDEO_CLOUDFRONT_DOMAIN ?? "";

  return (
    <div className="flex-1 px-6 bg-background">
      <div className="flex h-full w-full mt-6">
        <div className="bg-background flex flex-col gap-6 w-[70%] lg:w-[75%] xl:w-[81%] pr-4">
          <HlsVideoPlayer shortCode={shortCode} thumbnail={videoData.thumbnail} domain={domain} size="lg"/>
          <VideoInfo videoData={videoData} channelData={channelData}/>
          <CommentArea shortCode={shortCode}/>
        </div>
        <RecommendationList categories={categories}/>
      </div>
    </div>
  )
}

import { getVideoDetails } from "@/actions/video/get-video-details";
import { VideoForm } from "@/modules/studio/video/video-form";

export default async function VideoEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = await getVideoDetails(id);

  return <VideoForm video={video}/>;
}
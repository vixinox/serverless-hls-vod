'use server'import { prisma } from "@/lib/db/prisma";
export default async function checkVideoOwnerByShortCode(shortCode: string, userId: string) {
  const video = await prisma.video.findUnique({
    select: { id: true, channelId: true, deletedAt: true },
    where: { shortCode }
  });
  if (!video || video.deletedAt) throw new Error("视频不存在");

  const channel = await prisma.channel.findUnique({
    select: { id: true },
    where: { ownerId: userId }
  });
  if (!channel) throw new Error("用户频道不存在");

  if (video.channelId !== channel.id) throw new Error("无权编辑视频");

  return video.id;
}
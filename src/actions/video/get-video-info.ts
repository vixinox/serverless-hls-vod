'use server'

import prisma from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getVideoInfo(shortCode: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!shortCode) notFound();

  const video = await prisma.video.findUnique({
    where: { shortCode },
    select: {
      id: true,
      title: true,
      description: true,
      thumbnail: true,
      views: true,
      likesCount: true,
      commentsCount: true,
      createdAt: true,
      deletedAt: true,
      visibility: true,
      channel: {
        select: {
          id: true,
          name: true,
          subscribersCount: true,
          owner: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });
  if (!video || video.deletedAt || video.visibility !== "PUBLIC") notFound();

  let prevReaction = undefined
  if (userId) {
    const reaction = await prisma.videoReaction.findUnique({
      where: {
        userId_videoId: {
          userId: userId,
          videoId: video.id,
        }
      }
    });
    prevReaction = reaction?.reactionType ?? undefined;
  }

  const { channel, ...v } = video;

  return {
    videoData: {
      ...v,
      views: v.views,
      likesCount: v.likesCount,
      commentsCount: v.commentsCount,
      prevReaction,
    },
    channelData: {
      id: channel.id,
      name: channel.name,
      subscribersCount: channel.subscribersCount,
      owner: channel.owner,
    },
  };
}

export type GetVideoInfoResult = Awaited<ReturnType<typeof getVideoInfo>>;
export type VideoData = GetVideoInfoResult['videoData'];
export type ChannelData = GetVideoInfoResult['channelData'];
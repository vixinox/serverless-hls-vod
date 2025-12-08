'use server'import { prisma } from "@/lib/db/prisma";
export async function getVideos() {
  const videos = await prisma.video.findMany({
    where: {
      deletedAt: null,
      visibility: "PUBLIC"
    },
    select: {
      id: true,
      shortCode: true,
      title: true,
      description: true,
      views: true,
      thumbnail: true,
      type: true,
      createdAt: true,
      channel: {
        select: {
          owner: {
            select: {
              name: true,
              image: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const flattened = videos.map(v => ({
    id: v.id,
    shortCode: v.shortCode,
    title: v.title,
    description: v.description,
    views: v.views,
    thumbnail: v.thumbnail,
    type: v.type,
    createdAt: v.createdAt,
    ownerName: v.channel.owner.name,
    ownerImage: v.channel.owner.image
  }));

  return {
    long: flattened.filter(v => v.type === "LONG"),
    short: flattened.filter(v => v.type === "SHORT")
  };
}

export type VideoData = Awaited<ReturnType<typeof getVideos>>["long"][number];
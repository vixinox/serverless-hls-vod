'use server'

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";

export async function createVideo(filename: string, shortCode: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/sign-in');
  }

  const channel = await prisma.channel.findUnique({
    select: { id: true },
    where: { ownerId: session.user.id }
  });
  if (!channel) throw new Error(`用户频道不存在`);

  return prisma.video.create({
    data: {
      title: filename,
      shortCode: shortCode,
      filename: filename,
      channelId: channel.id,
      thumbnail: `https://${process.env.IMAGE_CLOUDFRONT_DOMAIN}/thumbnails/${shortCode}/thumbnail.jpg`,
    }
  });
}
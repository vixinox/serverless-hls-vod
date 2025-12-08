'use server'

import { auth } from "@/lib/auth";import { prisma } from "@/lib/db/prisma";
import { notFound, redirect } from "next/navigation";
import checkVideoOwnerByShortCode from "@/actions/video/check-video-owner";

export async function getVideoDetails(shortCode: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/sign-in');
  }

  const videoId = await checkVideoOwnerByShortCode(shortCode, session.user.id);

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: {
      title: true,
      description: true,
      thumbnail: true,
      visibility: true,
      shortCode: true,
      filename: true,
    },
  });

  if (!video) {
    notFound();
  }

  return video;
}
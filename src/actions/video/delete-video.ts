'use server'

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import checkVideoOwnerByShortCode from "@/actions/video/check-video-owner";

export async function deleteVideo(shortCode: string) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/sign-in');
  }

  const videoId = await checkVideoOwnerByShortCode(shortCode, session.user.id);

  return prisma.video.update({
    where: { id: videoId },
    data: { deletedAt: new Date() }
  });
}
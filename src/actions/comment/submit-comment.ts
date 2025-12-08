'use server'

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";import { prisma } from "@/lib/db/prisma";
export async function submitComment(shortCode: string, text: string) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/sign-in');

  const userId = session.user.id;

  const video = await prisma.video.findUnique({
    where: { shortCode },
    select: { id: true, deletedAt: true, visibility: true }
  });
  if (!video || video.deletedAt || video.visibility !== "PUBLIC")
    return;

  const comment = await prisma.comment.create({
    data: {
      content: text,
      videoId: video.id,
      userId: userId
    }
  })

  console.log('[submitComment called]', { shortCode, text });

  return {
    ...comment,
    commentId: comment.id,
    userId: userId,
    name: session.user.name!,
    image: session.user.image ?? undefined,
    prevReaction: undefined
  }
}
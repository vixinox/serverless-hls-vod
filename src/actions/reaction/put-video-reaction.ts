'use server'

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import type { ReactionType } from "@/../prisma/generated/prisma/client";

export async function putVideoReaction(videoId: string, reactionType?: ReactionType) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/auth/sign-in');

  const existing = await prisma.videoReaction.findUnique({
    where: { userId_videoId: { userId, videoId } }
  });

  if (!reactionType) {
    if (existing) {
      await prisma.videoReaction.delete({
        where: { userId_videoId: { userId, videoId } }
      });
      return { status: "removed" as const };
    }
    return { status: "noop" as const };
  }

  if (!existing) {
    await prisma.videoReaction.create({
      data: { userId, videoId, reactionType }
    });
    return { status: "created" as const };
  }

  if (existing.reactionType !== reactionType) {
    await prisma.videoReaction.update({
      where: { userId_videoId: { userId, videoId } },
      data: { reactionType }
    });
    return { status: "updated" as const };
  }

  return { status: "noop" as const };
}
'use server'

import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import type { ReactionType } from "@prisma/client";

export async function putReplyReaction(replyId: string, reactionType?: ReactionType) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect('/auth/sign-in');

  const existing = await prisma.replyReaction.findUnique({
    where: { userId_replyId: { userId, replyId } }
  });

  if (!reactionType) {
    if (existing) {
      await prisma.replyReaction.delete({
        where: { userId_replyId: { userId, replyId } }
      });
      return { status: "removed" as const };
    }
    return { status: "noop" as const };
  }

  if (!existing) {
    await prisma.replyReaction.create({
      data: { userId, replyId, reactionType }
    });
    return { status: "created" as const };
  }

  if (existing.reactionType !== reactionType) {
    await prisma.replyReaction.update({
      where: { userId_replyId: { userId, replyId } },
      data: { reactionType }
    });
    return { status: "updated" as const };
  }

  return { status: "noop" as const };
}
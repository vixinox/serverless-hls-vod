'use server'

import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import type { ReactionType } from "@prisma/client";

export async function putCommentReaction(commentId: string, reactionType?: ReactionType) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/auth/sign-in');

  const existing = await prisma.commentReaction.findUnique({
    where: { userId_commentId: { userId, commentId } }
  });

  if (!reactionType) {
    if (existing) {
      await prisma.commentReaction.delete({
        where: { userId_commentId: { userId, commentId } }
      });
      return { status: "removed" as const };
    }
    return { status: "noop" as const };
  }

  if (!existing) {
    await prisma.commentReaction.create({
      data: { userId, commentId, reactionType }
    });
    return { status: "created" as const };
  }

  if (existing.reactionType !== reactionType) {
    await prisma.commentReaction.update({
      where: { userId_commentId: { userId, commentId } },
      data: { reactionType }
    });
    return { status: "updated" as const };
  }

  return { status: "noop" as const };
}
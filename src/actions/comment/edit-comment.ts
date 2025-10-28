'use server'

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";

export async function editComment(
  commentId: string,
  content: string,
  type: 'comment' | 'reply' | undefined
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/auth/sign-in');

  if (!type) return;

  if (type === 'comment') {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true, deletedAt: true }
    });
    if (!comment || comment.deletedAt || comment.userId !== userId) return;

    return prisma.comment.update({
      where: { id: commentId },
      data: { content }
    });
  }

  if (type === 'reply') {
    const reply = await prisma.reply.findUnique({
      where: { id: commentId },
      select: { userId: true, deletedAt: true }
    });
    if (!reply || reply.deletedAt || reply.userId !== userId) return;

    return prisma.reply.update({
      where: { id: commentId },
      data: { content }
    });
  }
}
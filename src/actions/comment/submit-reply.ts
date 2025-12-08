'use server'

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";import { prisma } from "@/lib/db/prisma";
export async function submitReply(commentId: string, text: string) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/sign-in');

  const userId = session.user.id;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { deletedAt: true }
  });
  if (!comment || comment.deletedAt)
    return;

  const data = {
    content: text,
    commentId,
    userId
  };
  console.log(data);

  const reply = await prisma.reply.create({
    data: {
      content: text,
      commentId: commentId,
      userId: userId
    }
  })

  return {
    ...reply,
    replyId: reply.id,
    userId: userId,
    name: session.user.name!,
    image: session.user.image ?? undefined,
    prevReaction: undefined
  }
}
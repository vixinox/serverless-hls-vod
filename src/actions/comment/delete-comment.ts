'use server'

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";

export async function deleteComment(id: string, type: "comment" | "reply") {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/auth/sign-in');

  if (type === "comment") {
    const target = await prisma.comment.findUnique({
      where: { id },
      select: { userId: true, deletedAt: true },
    });
    if (!target || target.deletedAt || target.userId !== userId) return;
    const deleted = await prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return deleted.id;
  } else {
    const target = await prisma.reply.findUnique({
      where: { id },
      select: { userId: true, deletedAt: true },
    });
    if (!target || target.deletedAt || target.userId !== userId) return;
    const deleted = await prisma.reply.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return deleted.id;
  }
}
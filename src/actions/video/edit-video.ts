'use server'

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Visibility } from "@/../prisma/generated/prisma/client";
import * as z from "zod";
import checkVideoOwnerByShortCode from "@/actions/video/check-video-owner";

const editVideoSchema = z.object({
  shortCode: z.string().min(1),
  title: z.string().min(1).max(150).optional(),
  description: z.string().max(5000).optional(),
  thumbnail: z.string().optional(),
  visibility: z.enum(Visibility).optional(),
});

export async function editVideo(params: {
  shortCode: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  visibility?: Visibility;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/sign-in');
  }

  const parsed = editVideoSchema.safeParse(params);
  if (!parsed.success) {
    throw new Error(`输入数据不合法: ${parsed.error.message}`);
  }

  const { shortCode, title, description, thumbnail, visibility } = parsed.data;

  const videoId = await checkVideoOwnerByShortCode(shortCode, session.user.id);

  return prisma.video.update({
    where: { id: videoId },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(thumbnail && { thumbnail }),
      ...(visibility && { visibility }),
      updatedAt: new Date(),
    },
  });
}
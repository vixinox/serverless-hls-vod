"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { Prisma, Visibility } from "@/../prisma/generated/prisma/client";

interface ListUserVideosParams {
  page: number;
  pageSize: number;
  searchTerm?: string;
  categoryId?: string;
  visibility?: string;
}

export async function listUserVideos(params: ListUserVideosParams) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/sign-in');
  }

  const {
    page,
    pageSize,
    searchTerm = "",
    categoryId = "",
    visibility = ""
  } = params;

  const skip = (page - 1) * pageSize;
  const whereConditions: Prisma.VideoWhereInput = {
    channel: {
      ownerId: session.user.id,
    },
    deletedAt: null,
    ...(searchTerm && {
      title: { contains: searchTerm, mode: Prisma.QueryMode.insensitive },
    }),
    ...(categoryId && { categoryId }),
    ...(visibility && { visibility: visibility as Visibility }),
  };

  const videos = await prisma.video.findMany({
    where: whereConditions,
    skip,
    take: pageSize,
    include: {
      category: true,
      channel: {
        include: {
          owner: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalCount = await prisma.video.count({
    where: whereConditions,
  });

  return {
    videos,
    totalCount,
  };
}
'use server'

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { generateShortCode } from "@/lib/shortcode";
import prisma from "@/lib/db/prisma";

function createS3Client() {
  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export async function getVideoUploadUrl(
  filename: string,
  contentType: string
) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  const ext = path.extname(filename).toLowerCase();
  const s3 = createS3Client();

  let shortCode: string;
  let exists;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    if (attempts++ >= maxAttempts) {
      throw new Error("未知错误，无法生成shortCode，请稍后重试");
    }
    shortCode = generateShortCode();
    exists = await prisma.video.findUnique({
      select: { id: true },
      where: { shortCode },
    });
  } while (exists);

  const Key = `${shortCode}/${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_RAW_VIDEO_BUCKET!,
    Key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 300 });

  return { url, shortCode };
}

export async function getThumbnailUploadUrl(
  filename: string,
  contentType: string,
  shortCode: string
) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/sign-in');
  }

  const videoOwnerId = await prisma.video.findUnique({
    where: { shortCode },
    select: {
      channel: {
        select: {
          ownerId: true,
        },
      },
    },
  });
  if (videoOwnerId && videoOwnerId.channel.ownerId !== session.user.id) {
    throw new Error("非法操作");
  }

  const ext = path.extname(filename).toLowerCase();
  const allowedExt = [".jpg", ".jpeg", ".png"];
  if (!allowedExt.includes(ext)) {
    throw new Error("不支持的缩略图文件类型: " + ext);
  }

  const s3 = createS3Client();
  const Key = `thumbnails/${shortCode}/thumbnail${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_IMAGE_BUCKET,
    Key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 60 });

  return { url };
}
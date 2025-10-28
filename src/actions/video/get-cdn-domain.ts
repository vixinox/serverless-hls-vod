'use server'

export async function getVideoCdnDomain() {
  return process.env.VIDEO_CLOUDFRONT_DOMAIN || '';
}

export async function getImageCdnDomain() {
  return process.env.IMAGE_CLOUDFRONT_DOMAIN || '';
}
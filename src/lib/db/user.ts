import prisma from "@/lib/db/prisma";

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function isEmailOccupied(email: string) {
  try {
    const user = await prisma.user.findUnique({ select: { id: true }, where: { email } });
    return !!user;
  } catch (error) {
    console.error(`查询邮箱 ${email} 失败`, error);
    return false;
  }
}

export async function addUserToDb(name: string, email: string, password: string) {
  await prisma.user.create({
    data: { name, email, password },
  });
}
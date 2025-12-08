import NextAuth, { customFetch } from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import { getUserByEmail } from "@/lib/db/db";
import { verifyPassword } from "@/lib/password";
import { decode, encode } from "next-auth/jwt";
import { HttpsProxyAgent } from "https-proxy-agent";
import { generateShortCode } from "@/lib/shortcode";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

const proxyUrl = process.env.HTTPS_PROXY;
const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
async function proxyFetch(url: string, options): Promise<Response> {
  return await fetch(url, {
    ...options,
    agent: proxyAgent,
  }) as unknown as Response;
}

export const { auth, handlers, signIn } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  jwt: { encode, decode },
  providers: [
    GitHub({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      [customFetch]: proxyFetch,
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name || profile.login,
          email: profile.email ?? `${profile.id}@users.noreply.github.com`,
          image: profile.avatar_url
        };
      },
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        const user = await getUserByEmail(email);
        if (!user) return null;
        if (!user.password) return null;
        const isValid = verifyPassword(password, user.password);
        if (!isValid) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image
        };
      },
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.image = token.image as string | null;
      }
      return session;
    }
  },
  events: {
    async createUser({ user }) {
      const baseName = user.name ?? "user";
      let candidateName = baseName;
      const suffixLength = 5;
      const maxAttempts = 10;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          await prisma.channel.create({
            data: {
              ownerId: user.id!,
              name: candidateName,
            },
          });
          return;
        } catch (err: unknown) {
          if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
            const suffix = generateShortCode(suffixLength);
            candidateName = `${baseName}_${suffix}`;
          } else {
            throw err;
          }
        }
      }
      throw new Error(`频道创建失败：名称冲突过多`);
    },
  },
});
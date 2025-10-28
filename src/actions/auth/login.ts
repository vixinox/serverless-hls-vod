"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function credentialSignIn(
  prevState: string | null,
  queryData: FormData
): Promise<string | null> {
  try {
    const email = queryData.get("email");
    const password = queryData.get("password");

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError && error.type === "CredentialsSignin") {
      return "用户名或密码错误";
    }
    console.error("登录请求失败:", error);
    return "网络或服务器错误，请稍后再试";
  }
  redirect("/")
}

export async function githubSignIn() {
  await signIn("github");
}
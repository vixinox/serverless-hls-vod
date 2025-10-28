"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { credentialSignIn, githubSignIn } from "@/actions/auth/login";
import Image from "next/image";

export function LoginForm() {
  const [message, formAction, isPending] = useActionState(credentialSignIn, null);

  return (
    <div>
      <form className="space-y-4" action={formAction}>
        {message && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p>{message}</p>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input id="email" name="email" type="email" placeholder="mail@example.com" required/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">密码</Label>
          <Input id="password" name="password" type="password" placeholder="******" required/>
        </div>
        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? "登录中..." : "使用密码登录"}
        </Button>
      </form>

      <div className="flex items-center my-6">
        <div className="flex-grow border-t border-gray-200"/>
        <span className="mx-4 text-sm text-gray-500">或</span>
        <div className="flex-grow border-t border-gray-200"/>
      </div>

      <form action={githubSignIn}>
        <Button
          className="w-full flex items-center justify-center"
          type="submit"
          disabled={isPending}
        >
          <Image src="/github.svg" alt="GitHub" width={20} height={20}/>
          <p>使用 GitHub 登录</p>
        </Button>
      </form>
    </div>
  );
}
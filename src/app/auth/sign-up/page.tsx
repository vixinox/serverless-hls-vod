"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { signUpSchema } from "@/lib/validation";
import { register } from "@/actions/auth/register";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [message, formAction, isPending] = useActionState(register, null);

  useEffect(() => {
    if (!message) return;
    if (message.type === "success") {
      toast.success(message.text);
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } else {
      toast.error(message.text);
    }
  }, [message, router]);

  const validate = (field: "name" | "email" | "password", value: string) => {
    const result = signUpSchema.safeParse({
      name: field === "name" ? value : name,
      email: field === "email" ? value : email,
      password: field === "password" ? value : password,
    });
    if (!result.success) {
      const nameIssue = result.error.issues.find((i) => i.path[0] === "name");
      const emailIssue = result.error.issues.find((i) => i.path[0] === "email");
      const passwordIssue = result.error.issues.find((i) => i.path[0] === "password");
      setNameError(nameIssue?.message || "");
      setEmailError(emailIssue?.message || "");
      setPasswordError(passwordIssue?.message || "");
    } else {
      setNameError("");
      setEmailError("");
      setPasswordError("");
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setName(email);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle>注册</CardTitle>
          <CardDescription>创建一个新的账号</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={formAction}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">名字</Label>
              {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
              <Input
                id="name"
                name="name"
                type="text"
                value={name}
                disabled={isPending}
                placeholder="你的名字（可选）"
                onChange={(e) => {
                  setName(e.target.value);
                  validate("name", e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              {emailError && (
                <p className="text-red-500 text-sm">{emailError}</p>
              )}
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                disabled={isPending}
                placeholder="mail@example.com"
                onChange={(e) => {
                  setEmail(e.target.value);
                  validate("email", e.target.value);
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                disabled={isPending}
                placeholder="******"
                onChange={(e) => {
                  setPassword(e.target.value);
                  validate("password", e.target.value);
                }}
                required
              />
            </div>
            <Button className="w-full" type="submit" disabled={isPending}>
              注册
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            已有账号？{" "}
            <Link
              href="/auth/sign-in"
              className="text-blue-600 hover:underline"
            >
              去登录
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
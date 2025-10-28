import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./sign-in-form";
import Link from "next/link";

export default async function SignInPage() {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle>登录</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm/>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            还没有账号？{" "}
            <Link href="/auth/sign-up" className="text-blue-600 hover:underline">
              去注册
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
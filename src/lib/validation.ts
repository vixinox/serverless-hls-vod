import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "用户名至少 2 位").max(32, "用户名不能超过 32 位"),
  email: z.email("邮箱格式不正确"),
  password: z.string().min(3, "密码至少 3 位").max(32, "密码不能超过 32 位"),
});
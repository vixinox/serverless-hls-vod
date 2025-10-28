"use server";
import { signIn } from "@/lib/auth";
import { saltAndHashPassword } from "@/lib/password";
import { addUserToDb, isEmailOccupied } from "@/lib/db/db";
import { signUpSchema } from "@/lib/validation";
import {
  AppError,
  ConflictErrorCode,
  ErrorCategory,
  getErrorMessage,
  SystemErrorCode,
  ValidationErrorCode,
} from "@/lib/errors";

export type RegisterResult = {
  type: "success" | "error";
  text: string;
};

export async function register(
  _prevState: RegisterResult | null,
  queryData: FormData
): Promise<RegisterResult | null> {
  try {
    const rawName = queryData.get("name")?.toString().trim() || "";
    const rawEmail = queryData.get("email")?.toString().trim() || "";
    const rawPassword = queryData.get("password")?.toString() || "";

    const parsed = signUpSchema.safeParse({
      name: rawName || rawEmail,
      email: rawEmail,
      password: rawPassword,
    });

    if (!parsed.success) {
      throw new AppError(
        ErrorCategory.VALIDATION,
        ValidationErrorCode.INVALID_EMAIL,
        parsed.error.issues[0].message
      );
    }

    const { name, email, password } = parsed.data;

    if (await isEmailOccupied(email)) {
      throw new AppError(
        ErrorCategory.CONFLICT,
        ConflictErrorCode.EMAIL_OCCUPIED
      );
    }

    const hashedPassword = saltAndHashPassword(password);
    await addUserToDb(name, email, hashedPassword);

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { type: "success", text: "注册成功" };
  } catch (err) {
    if (err instanceof AppError) {
      return { type: "error", text: getErrorMessage(err.code) };
    }
    return { type: "error", text: getErrorMessage(SystemErrorCode.UNKNOWN) };
  }
}
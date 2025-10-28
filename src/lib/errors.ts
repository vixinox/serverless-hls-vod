export enum ErrorCategory {
  VALIDATION = "VALIDATION",
  CONFLICT = "CONFLICT",
  SYSTEM = "SYSTEM",
}

export enum ValidationErrorCode {
  INVALID_EMAIL = "INVALID_EMAIL",
  INVALID_PASSWORD = "INVALID_PASSWORD",
}

export enum ConflictErrorCode {
  EMAIL_OCCUPIED = "EMAIL_OCCUPIED",
}

export enum SystemErrorCode {
  UNKNOWN = "UNKNOWN",
  DB_ERROR = "DB_ERROR",
  AUTH_ERROR = "AUTH_ERROR",
}

export const ErrorMessages: Record<string, string> = {
  [ValidationErrorCode.INVALID_EMAIL]: "邮箱格式不正确",
  [ValidationErrorCode.INVALID_PASSWORD]: "密码不符合安全要求",

  [ConflictErrorCode.EMAIL_OCCUPIED]: "邮箱已被注册",

  [SystemErrorCode.UNKNOWN]: "系统繁忙，请稍后再试",
  [SystemErrorCode.DB_ERROR]: "数据库异常，请联系管理员",
  [SystemErrorCode.AUTH_ERROR]: "身份验证失败，请重新登录",
};

export class AppError extends Error {
  category: ErrorCategory;
  code: string;

  constructor(category: ErrorCategory, code: string, details?: string) {
    super(details ?? ErrorMessages[code] ?? "未知错误");
    this.name = "AppError";
    this.category = category;
    this.code = code;
  }
}

export function getErrorMessage(code: string): string {
  return ErrorMessages[code] ?? "未知错误";
}
'use client'
import { cn } from "@/lib/utils";
import { ChangeEvent, TextareaHTMLAttributes, useState } from "react";
import { WandSparkles } from "lucide-react";
import { askGpt } from "@/actions/ai/ask-gpt";

export interface FloatingTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  maxLength: number;
  error?: string;
  initialHeight?: number;
  needAI?: boolean;
}

export function FloatingTextarea({
                                   label,
                                   placeholder,
                                   maxLength,
                                   error: externalError,
                                   initialHeight,
                                   rows = 3,
                                   value: externalValue = "",
                                   onChange,
                                   needAI = false,
                                   ...props
                                 }: FloatingTextareaProps) {
  const [value, setValue] = useState(externalValue);
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState<string | undefined>(undefined);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (e.target.value.length > 0) setAiError(undefined);
    onChange?.(e);
  };

  const handleAI = async () => {
    if (loading) return;
    if (!value) {
      setAiError("请输入内容");
      return;
    }
    setLoading(true);
    setAiError(undefined);

    const promptEnhance = `
      你是一位文本润色助手。  
      任务规则：
      1. 优化表达的流畅度与可读性，保留原意、信息顺序和原本的语言风格（包括语气、基调、情感色彩），然后进行一定的润色。如果文本表达不通畅或有明显错误或中断缺失，可以进行纠正。
      2. 保留原语言类型：中文保持中文，英文保持英文，混合语言保持原比例；保留特定用语（方言、网络流行语），除非明显错字或语法错误影响理解。
      3. 如果输入为空、长度 ≤3 字符、仅由符号或数字组成、或缺乏可理解内容，则直接原样返回，不做任何修改。
      4. 不输出任何额外说明、标题、引号或解释性文字，只输出润色后的文本。
      
      下面是要处理的文本：
      ${value}
    `;

    const result = await askGpt(`${promptEnhance}`);

    setLoading(false);

    if (result.success) {
      setValue(result.data!);
    } else {
      setAiError(result.error);
    }
  };

  const mergedError = aiError || externalError;

  return (
    <div
      className={cn(
        "relative w-full flex flex-col transition-all rounded-lg border-2",
        mergedError && "border-destructive", loading && "gradient-border"
      )}
    >
      <p className={cn("text-xs text-muted-foreground pt-2 pl-3", loading && "gradient-text")}>{label}</p>

      <textarea
        id={label}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        rows={rows}
        placeholder={placeholder}
        style={initialHeight ? { height: initialHeight } : undefined}
        className={cn(
          "min-h-18 whitespace-pre-wrap break-all outline-none peer",
          "placeholder:text-muted-foreground flex field-sizing-content bg-transparent px-3 py-2 text-sm shadow-xs",
          loading && "gradient-text",
        )}
        {...props}
      />

      <div
        className={cn(
          "absolute bottom-1 right-2 text-xs text-muted-foreground transition-opacity opacity-0 peer-focus:opacity-100",
          mergedError && "opacity-100",
          mergedError && "text-destructive"
        )}
      >
        {String(value)?.length ?? 0}/{maxLength}
      </div>

      {needAI && (
        <WandSparkles
          className={cn(
            "absolute top-2 right-2 size-5.5 cursor-pointer transition text-muted-foreground hover:text-foreground",
       mergedError && "text-destructive",
       loading && "gradient-text cursor-not-allowed"
          )}
          onClick={handleAI}
          strokeWidth="1.5"
        />
      )}

      {mergedError && (
        <p className="text-xs text-destructive px-3 pb-2 transition">{mergedError}</p>
      )}
    </div>
  );
}
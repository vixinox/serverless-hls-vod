'use client'

import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputHTMLAttributes } from "react";

interface UploadStepProps {
  getInputProps: () => InputHTMLAttributes<HTMLInputElement>;
  open: () => void;
  isDragActive: boolean;
  error?: string;
  uploadProgress: number;
  isUploading: boolean;
}

export function UploadStep({
                             getInputProps,
                             open,
                             isDragActive,
                             error,
                             uploadProgress,
                             isUploading,
                           }: UploadStepProps) {
  const RADIUS = 45;
  const STROKE = 3;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const offset = CIRCUMFERENCE * (1 - uploadProgress / 100);

  return (
    <div className="flex-1 flex flex-col justify-center items-center">
      <input {...getInputProps()} />

      <div
        className={cn(
          "w-34 h-34 p-10 rounded-full bg-studio-background brightness-80 border-2 transition",
          isDragActive ? "border-blue-500" : "border-transparent",
          isUploading ? "opacity-50 cursor-not-allowed" : "opacity-100 cursor-pointer"
        )}
        onClick={() => {
          if (isUploading) return;
          open();
        }}
      >
        <svg
          className="w-38 h-38 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
          />
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="#00d600"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{
              transition: 'stroke-dashoffset 0.3s ease'
            }}
          />
        </svg>
        <Upload className="size-full brightness-75"/>
      </div>
      <p className="mt-6">将要上传的视频文件拖放到此处</p>
      <p className="text-sm text-muted-foreground mt-1">
        你的视频在发布之前将处于私享状态
      </p>
      {!isUploading &&
       <Button
         className="rounded-full mt-8 cursor-pointer font-medium"
         disabled={isUploading}
         onClick={() => {
           if (isUploading) return;
           open();
         }}
       >
         上传视频
       </Button>}
      {error && <div className="mt-5 text-sm text-red-600">{error}</div>}
    </div>
  );
}
'use client'

import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ReactNode, useCallback, useState } from "react";
import { X } from "lucide-react";
import { FileRejection, useDropzone } from 'react-dropzone';
import { UploadStep } from "@/modules/studio/video/upload-step";
import { VideoForm } from "@/modules/studio/video/video-form";
import { Video } from "@prisma/client";
import { createVideo } from "@/actions/video/create-video";
import { toast } from "sonner";
import { getVideoUploadUrl } from "@/actions/video/get-upload-url";

export const VideoUploadDialog = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<"upload" | "edit">("upload");
  const [video, setVideo] = useState<Video>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const reset = () => {
    setTimeout(() => {
      setDialogOpen(false);
      setError("");
      setUploadProgress(0);
      setCurrentStep("upload");
      setVideo(undefined);
    }, 100);
  };

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setError("");
      setUploadProgress(0);
      setIsUploading(true);

      try {
        const { url, shortCode } = await getVideoUploadUrl(file.name, file.type);

        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url, true);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = async () => {
          if (xhr.status === 200) {
            console.log("上传完成");
            try {
              const createdVideo = await createVideo(file.name, shortCode);
              setVideo(createdVideo);
              setCurrentStep("edit");
              toast("上传成功", { description: "已保存视频为草稿" });
            } catch (err) {
              console.error("调用uploadVideo失败", err);
              setError("保存视频信息失败");
              toast("上传失败", { description: "保存视频信息失败" });
            }
          } else {
            setError(`上传失败: ${xhr.status}`);
            toast("上传失败", { description: xhr.status });
          }
          setIsUploading(false);
        };

        xhr.onerror = () => {
          setError("上传过程中出错");
          toast("上传失败", { description: "视频上传过程中发生错误" });
        };

        xhr.send(file);
      } catch (err) {
        console.error(err);
        setError("获取上传URL失败");
        toast("上传失败", { description: "获取上传URL失败" });
      }
    }

    if (fileRejections && fileRejections.length > 0) {
      setError("只能上传 mp4 视频文件");
      console.warn(fileRejections);
      toast("上传失败", { description: "只能上传 mp4 视频文件" });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "video/mp4": [],
    },
    multiple: false,
    noClick: true,
  });

  const renderStep = (currentStep: string) => {
    switch (currentStep) {
      case "upload":
        return (
          <UploadStep
            getInputProps={getInputProps}
            open={open}
            isDragActive={isDragActive}
            error={error}
            uploadProgress={uploadProgress}
            isUploading={isUploading}
          />
        );
      case "edit":
        return video && (
          <VideoForm
            isInDialog
            video={video}
            onComplete={reset}
          />
        )
      default:
        return null;
    }
  }

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(o) => {
        setDialogOpen(o);
        if (!o) reset();
      }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent
        className="flex flex-col w-240 h-200 max-h-[90%] p-0 rounded-3xl border-none bg-studio-background overflow-auto"
        showCloseButton={false}>
        <DialogHeader className="relative h-10.5">
          <DialogTitle className="text-xl font-medium ml-6 my-3.75">
            {currentStep === 'upload' ? '上传视频' : video?.title}
          </DialogTitle>

          <DialogClose asChild>
            <button className="absolute top-2 right-5.5 rounded-full w-10 h-10 p-1.75
             bg-transparent hover:bg-foreground/10 cursor-pointer transition duration-100">
              <X className="size-full" strokeWidth={1}/>
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 flex flex-col justify-start items-center border-t" {...getRootProps()} >
          {renderStep(currentStep)}
        </div>

        {currentStep === 'upload' && (
          <div className="flex items-center justify-center h-12 mb-6">
            <p className="text-muted-foreground text-sm">提交视频，确保你确认同意服务条款和社区准测</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
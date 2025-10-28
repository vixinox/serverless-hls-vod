"use client"

import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AlignJustify, Clapperboard } from "lucide-react";
import { AuthButton } from "@/components/auth-button";
import { VideoUploadDialog } from "@/modules/studio/video/upload-dialog";
import { DarkModeToggle } from "@/components/DarkModeToggle";

export function StudioNavbar() {
  const { toggleSidebar } = useSidebar()

  return (
    <nav className="flex justify-center w-full p-2 fixed z-50 drop-shadow-lg bg-studio-background">
      <div className="flex-1 flex justify-start items-center gap-4 ml-2">
        <Button
          variant={'ghost'}
          className='rounded-full h-full aspect-square hover:bg-primary/15 cursor-pointer'
          onClick={toggleSidebar}
        >
          <AlignJustify className="size-full" strokeWidth={1.5}/>
        </Button>
      </div>

      <div className="flex-1 flex justify-end items-center gap-4">
        <DarkModeToggle/>
        <VideoUploadDialog>
          <Button variant="outline" className="rounded-full border hover:bg-primary/15 cursor-pointer">
            <Clapperboard/>
            创建
          </Button>
        </VideoUploadDialog>
        <AuthButton/>
      </div>
    </nav>
  )
}
import { auth } from "@/lib/auth";
import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { StudioNavbar } from "@/modules/studio/basic/studio-navbar";
import { StudioSidebar } from "@/modules/studio/basic/studio-sidebar";
import { SessionProvider } from "next-auth/react";

export default async function StudioLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return (
    <SidebarProvider defaultOpen>
      <SessionProvider session={session}>
        <div className="w-full bg-studio-background">
          <StudioNavbar/>
          <div className="w-full h-16"/>
          <div className="flex">
            <StudioSidebar/>
            <div className="flex-1">
              {children}
            </div>
          </div>
        </div>
      </SessionProvider>
    </SidebarProvider>
  );
}
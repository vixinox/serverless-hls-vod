import { HomeNavbar } from "@/modules/home/home-navbar";
import { auth } from "@/lib/auth";
import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SessionProvider } from "next-auth/react";
import { HomeSidebar } from "@/modules/home/home-sidebar";

export default async function VideoLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <SidebarProvider defaultOpen={false}>
      <SessionProvider session={session}>
        <div className="w-full h-full">
          <HomeNavbar/>
          <HomeSidebar alwaysSheet/>
          <div className="flex">
            {children}
          </div>
        </div>
      </SessionProvider>
    </SidebarProvider>
  );
}
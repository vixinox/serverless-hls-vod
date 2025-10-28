"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSidebar } from '@/components/ui/sidebar'
import { AlignJustify, Search } from 'lucide-react'
import { AuthButton } from "@/components/auth-button";
import { useEffect, useState } from "react";

export const HomeNavbar = () => {
  const { toggleSidebar } = useSidebar()
  const [isAtTop, setisAtTop] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setisAtTop(window.scrollY === 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`flex h-14 justify-center top-0 px-4 w-full sticky z-50 transition-all duration-150 
      ${isAtTop ? 'bg-transparent' : 'bg-background'}`}>
      <div className="flex-1 flex justify-start items-center gap-4">
        <Button
          variant={'ghost'}
          className='rounded-full w-10 h-10 cursor-pointer hover:bg-foreground/10!'
          onClick={toggleSidebar}
        >
          <AlignJustify className="size-6" strokeWidth="1"/>
        </Button>
      </div>

      <div className='w-160 flex-shrink-0 flex items-center'>
        <Input
          type='text'
          className='rounded-l-full h-10 focus:border-blue-500'
          placeholder=' 搜索'
        />
        <Button
          className='rounded-r-full w-14 h-10 border bg-foreground/20 cursor-pointer'
          variant={'ghost'}
          type='submit'
        >
          <Search className="size-5!"/>
        </Button>
      </div>

      <div className="flex-1 flex justify-end items-center mr-8">
        <AuthButton/>
      </div>
    </nav>
  )
}


'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut, PanelLeft, PinOff, Pin, Settings, User, Award, LifeBuoy, BookOpen, TooltipIcon, Beaker, Book, ArrowLeft, GraduationCap, Wrench, Lock, LayoutDashboard, Home, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants, Button } from "./ui/button";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useSidebar } from "./ui/sidebar";
import { appConfig } from "@/lib/config";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { theoryContent } from "@/lib/theory";
import { useState, ReactNode, useEffect, useRef, lazy, Suspense } from "react";
import { UserProfile } from "./UserProfile";
import type { NavLink } from "@/lib/types";

const motion = {
  div: lazy(() => import('framer-motion').then(m => ({ default: m.motion.div })))
};
const AnimatePresence = lazy(() => import('framer-motion').then(m => ({ default: m.AnimatePresence })));


type ActiveMenu = 'main' | 'course';

interface AppSidebarProps {
    onLinkClick?: () => void;
    courseNavLinks?: NavLink[];
}

export function AppSidebar({ onLinkClick, courseNavLinks = [] }: AppSidebarProps) {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('main');
  
  const isCoursePage = courseNavLinks.length > 0;
  // Let's derive the expanded state from either being 'open' (pinned) or hovered.
  const isExpanded = open || isHovered;
  
  useEffect(() => {
    setActiveMenu(isCoursePage ? 'course' : 'main');
  }, [isCoursePage, pathname]);


  const handleLinkClick = () => {
      if (onLinkClick) {
          onLinkClick();
      }
  }

  const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    // Check if the mouse is leaving to go into a dropdown menu
    if (event.currentTarget.querySelector('[data-state="open"]')) {
      return;
    }
    setIsHovered(false);
  };

  const menuVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  const SidebarLink = ({ href, label, icon: Icon, activeIcon: ActiveIcon, textColor }: { href: string, label: string, icon: React.ElementType, activeIcon?: React.ElementType, textColor?: string }) => {
    let isActive = false;
    if (href === '/dashboard' || href === '/') {
        isActive = pathname === href;
    } else {
        isActive = pathname.startsWith(href);
    }
    
    if(href === '/courses' && (pathname.startsWith('/course/') || pathname.startsWith('/my-courses'))) {
        isActive = false;
    }

    if(href === '/my-courses' && (pathname.startsWith('/course/'))) {
        isActive = true;
    }


    const FinalIcon = isActive && ActiveIcon ? ActiveIcon : Icon;
    const colorClass = textColor ? textColor : 'text-sidebar-foreground';

    const linkContent = (
        <>
            <FinalIcon className="h-5 w-5 shrink-0" />
            <span className={cn("text-sm", !isExpanded && "sr-only")}>{label}</span>
        </>
    );

    const commonClasses = cn(
        "flex items-center gap-4 h-11 w-full rounded-lg transition-colors",
        isExpanded ? "justify-start px-4" : "justify-center px-0",
        `text-sidebar-foreground/80 hover:bg-primary/20 hover:text-white ${isActive ? "bg-primary/20 font-semibold text-white" : "bg-transparent font-medium"}`
    );
    
    return (
     <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <Link 
                    href={href}
                    onClick={handleLinkClick}
                    className={commonClasses}
                    >
                    {linkContent}
                </Link>
            </TooltipTrigger>
            {(!isExpanded || onLinkClick) && (
                <TooltipContent side="right">
                    {label}
                </TooltipContent>
            )}
        </Tooltip>
    </TooltipProvider>
    )
  };
  
  const renderMainMenu = () => (
     <motion.div
        key="main"
        variants={menuVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-2 w-full"
      >
        <SidebarLink href="/dashboard" label="Dashboard" icon={LayoutDashboard} />
        <SidebarLink href="/my-courses" label="Mis Cursos" icon={GraduationCap} />
        <SidebarLink href="/courses" label="Explorar" icon={Search} />
        <SidebarLink href="/tools" label="Gadgets Digitales" icon={Wrench} />
     </motion.div>
  );

  const renderCourseMenu = () => (
      <motion.div
        key="course"
        variants={menuVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-1 w-full"
      >
        <div className={cn("mb-2 flex items-center w-full")}>
            <SidebarLink href="/courses" label="Volver a Cursos" icon={ArrowLeft} />
        </div>
        <Separator className="bg-sidebar-foreground/20 my-2" />
        {courseNavLinks.map((link) => (
            <SidebarLink key={link.href} href={link.href} label={link.label} icon={link.icon} />
        ))}
      </motion.div>
  )


  return (
     <aside 
        className={cn(
            "fixed inset-y-0 left-0 z-50 flex-col gap-2 py-4 border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
            onLinkClick ? 'flex w-full' : 'hidden sm:flex',
            isExpanded ? "sm:w-64" : "sm:w-20"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
     >
        <div className={cn("flex items-center w-full px-4", isExpanded ? "justify-between" : "justify-center")}>
           <Link href="/" className={cn("flex items-center gap-2 group", !isExpanded && "justify-center")} onClick={() => { setActiveMenu('main'); if(onLinkClick) onLinkClick(); }}>
              <Image 
                  src="https://i.postimg.cc/y85SkNRx/Circuit-Hub-Logo.png"
                  alt={`${appConfig.title} Logo`}
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0"
              />
              <span className={cn("text-xl font-bold font-headline tracking-tight transition-colors group-hover:text-primary/80", !isExpanded && "sm:hidden")}>{appConfig.title}</span>
          </Link>
            {isExpanded && (
                <Button variant="ghost" size="icon" className="h-10 w-10 text-sidebar-foreground hover:bg-primary/20 hover:text-sidebar-foreground" onClick={() => setOpen(!open)}>
                    {open ? <Pin /> : <PinOff />}
                    <span className="sr-only">{open ? "Desfijar panel" : "Fijar panel"}</span>
                </Button>
            )}
       </div>
       <Separator className="bg-sidebar-foreground/20" />
       
       <nav className="flex flex-col gap-2 p-2 flex-1 overflow-y-auto">
            <Suspense fallback={<div className="h-full w-full"/>}>
              <AnimatePresence mode="wait">
                  {activeMenu === 'main' && renderMainMenu()}
                  {activeMenu === 'course' && renderCourseMenu()}
              </AnimatePresence>
            </Suspense>
       </nav>

        {!onLinkClick && (
             <div className="mt-auto p-2">
                <Separator className="my-2 bg-sidebar-foreground/20" />
                <div className={cn(
                    "flex items-center w-full rounded-lg text-left transition-colors",
                    !isExpanded && 'justify-center'
                )}>
                    <UserProfile showName={isExpanded} />
                </div>
            </div>
        )}
    </aside>
  );
}

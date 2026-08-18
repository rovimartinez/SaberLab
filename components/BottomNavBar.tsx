

'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Wrench, User, GraduationCap, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfile } from "./UserProfile";
import { useIsMobile } from "@/hooks/use-mobile";

const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/my-courses", label: "Cursos", icon: GraduationCap },
    { href: "/courses", label: "Explorar", icon: BookOpen },
    { href: "/tools", label: "Gadgets", icon: Wrench },
    { href: "/profile", label: "Perfil", icon: User },
];

export function BottomNavBar() {
    const pathname = usePathname();
    const isMobile = useIsMobile();

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-sidebar border-t border-sidebar-foreground/20 shadow-lg grid grid-cols-5 items-center justify-around sm:hidden z-50 px-2 gap-1">
            {navLinks.map((link) => {
                let isActive = false;
                if (link.href === '/courses') {
                    // Only active for /courses, not for individual course sub-routes
                    isActive = pathname === '/courses' || pathname.startsWith('/course/');
                } else if (link.href === '/my-courses') {
                    isActive = pathname === '/my-courses';
                }
                else if (link.href === '/dashboard') {
                    isActive = pathname === '/dashboard';
                }
                 else {
                    // Default behavior for other links
                    isActive = pathname.startsWith(link.href) && link.href !== '/';
                }
                
                const Icon = link.icon;
                return (
                    <Link 
                        href={link.href === '/courses' ? '/courses' : link.href}
                        key={link.label}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 w-full h-12 rounded-lg transition-all duration-300",
                            isActive 
                                ? "bg-primary text-primary-foreground scale-105" 
                                : "text-sidebar-foreground/70 hover:bg-primary/10"
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        <span className="text-2xs font-medium">{link.label}</span>
                    </Link>
                )
            })}
        </nav>
    );
}

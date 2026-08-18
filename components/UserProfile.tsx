

'use client';

import Link from "next/link";
import { LogOut, LifeBuoy, User, UserPlus, LogIn, Sun, Moon, Wrench, RefreshCw, GraduationCap, Award, Home, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { signOut, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";

interface UserProfileProps {
    showName?: boolean;
    className?: string;
    isMobile?: boolean;
}

function LoggedInAvatar({ user, showName, className, isMobile }: { user: FirebaseUser } & UserProfileProps) {
    const { setTheme, theme } = useTheme();

    const getInitials = (name: string | null) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    
    if (isMobile) {
        return (
             <DropdownMenu>
                <DropdownMenuTrigger className="flex flex-col items-center justify-center gap-1 w-full h-full">
                    <Avatar className="h-5 w-5">
                        <AvatarImage src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'U'}&background=random&color=fff`} alt={user.displayName || 'Usuario'} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <span className="text-2xs font-medium">Perfil</span>
                </DropdownMenuTrigger>
                 <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none truncate">{user.displayName || "Usuario"}</p>
                           <p className="text-xs leading-none text-muted-foreground truncate">
                            {user.email || 'Sin correo'}
                          </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/tools">
                        <Wrench className="mr-2 h-4 w-4" />
                        <span>Gadgets Digitales</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/certificate/electricidad-basica">
                        <Award className="mr-2 h-4 w-4" />
                        <span>Mi Certificado</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                        {theme === 'light' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                        <span>Cambiar Tema</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <LifeBuoy className="mr-2 h-4 w-4" />
                        <span>Centro de Ayuda</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut(auth).then(() => window.location.href = '/')}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn("w-full", className)}>
                    <div
                        className={cn(
                            "flex items-center w-full rounded-lg text-left transition-colors text-sidebar-foreground",
                            isMobile ? "justify-center p-0" : "gap-2 p-2",
                            !showName && !isMobile && "p-0 justify-center"
                        )}
                    >
                        <Avatar className={cn("h-9 w-9 shrink-0", isMobile && "h-5 w-5")}>
                            <AvatarImage src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'U'}&background=random&color=fff`} alt={user.displayName || 'Usuario'} />
                            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                        {showName && (
                            <div className="flex-grow min-w-0">
                                <p className="text-sm font-medium leading-tight truncate">{user.displayName || "Usuario"}</p>
                            </div>
                        )}
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none truncate">{user.displayName || "Usuario"}</p>
                       <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email || 'Sin correo'}
                      </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <Link href="/tools">
                    <Wrench className="mr-2 h-4 w-4" />
                    <span>Gadgets Digitales</span>
                  </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <Link href="/certificate/electricidad-basica">
                    <Award className="mr-2 h-4 w-4" />
                    <span>Mi Certificado</span>
                  </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                    {theme === 'light' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                    <span>Cambiar Tema</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    <span>Centro de Ayuda</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut(auth).then(() => window.location.href = '/')}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function LoggedOutButtons({ showName, isMobile, className }: UserProfileProps) {
    if (isMobile) {
        return (
             <div className="flex flex-col gap-2 w-full">
                <Button asChild variant="outline" className="w-full justify-center">
                   <Link href="/login"><LogIn className="mr-2"/> Iniciar Sesión</Link>
                </Button>
                <Button asChild className="w-full justify-center">
                   <Link href="/signup"><UserPlus className="mr-2"/> Registrarse</Link>
                </Button>
             </div>
        )
    }
    
    if (!showName) {
        return (
            <div className="flex flex-col items-center justify-center gap-2">
                 <Button asChild variant="ghost" size="icon" className="text-sidebar-foreground">
                   <Link href="/login" title="Iniciar Sesión"><LogIn/></Link>
                </Button>
                 <Button asChild variant="ghost" size="icon" className="text-sidebar-foreground">
                   <Link href="/signup" title="Registrarse"><UserPlus/></Link>
                </Button>
            </div>
        )
    }

    return (
        <div className={cn("grid grid-cols-2 gap-2 w-full", className)}>
            <Button asChild variant="ghost" className="text-sidebar-foreground hover:bg-primary/10 hover:text-sidebar-foreground text-xs p-2 h-auto">
               <Link href="/login"><LogIn /> Iniciar Sesión</Link>
            </Button>
            <Button asChild className="text-xs p-2 h-auto">
               <Link href="/signup"><UserPlus /> Registrarse</Link>
            </Button>
         </div>
    )
}


export function UserProfile({ showName = false, className, isMobile = false }: UserProfileProps) {
    const { user, loading } = useAuth();

    if (loading) {
        const heightClass = showName ? 'h-[52px]' : isMobile ? 'h-5' : 'h-10';
        const widthClass = isMobile ? 'w-5' : 'w-10';
        return (
            <div className={cn('flex items-center justify-center', isMobile ? 'p-0': 'p-2', heightClass, widthClass, className)}>
                <RefreshCw className="h-5 w-5 animate-spin text-sidebar-foreground/50" />
            </div>
        );
    }

    if (!user) {
        return <LoggedOutButtons showName={showName} isMobile={isMobile} className={className} />;
    }
    
    return <LoggedInAvatar user={user} showName={showName} isMobile={isMobile} className={className} />;
}

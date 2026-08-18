

'use client';

import { ChevronLeft, Home, Wrench, MoreVertical, LayoutDashboard, BookOpen } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { appConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface LearnHeaderProps {
    moduleTitle?: string | null;
    lessonTitle?: string | null;
    showBackButton?: boolean;
    onBack?: () => void;
    onGadgetsClick?: () => void;
}

export const LearnHeader = ({ moduleTitle, lessonTitle, showBackButton, onBack, onGadgetsClick }: LearnHeaderProps) => {
    const router = useRouter();
    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-2 w-full">
            <div className="w-10 flex-shrink-0 justify-start">
            </div>
            
            <div className="flex-1 text-center leading-tight px-2">
                {moduleTitle && <p className="text-xs text-muted-foreground truncate">{moduleTitle}</p>}
                <h1 className="text-sm font-semibold truncate">{lessonTitle}</h1>
            </div>

            <div className="w-10 flex-shrink-0 flex justify-end">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/learn">
                                <BookOpen className="mr-2 h-4 w-4" />
                                <span>Progreso del Curso</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/tools">
                                <Wrench className="mr-2 h-4 w-4" />
                                <span>Gadgets Digitales</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

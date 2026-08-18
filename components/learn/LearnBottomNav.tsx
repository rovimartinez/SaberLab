

'use client';

import { cn } from "@/lib/utils";
import { Trophy, Book, CircuitBoard, Component, GraduationCap, Wrench, CheckCircle } from "lucide-react";
import type { Module } from "@/lib/data/electricidad-basica";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { LessonList } from "./LessonList";
import { useAppState } from "@/hooks/use-learn";
import { usePathname, useRouter } from "next/navigation";
import { courseData } from "@/lib/data/electricidad-basica";

interface LearnBottomNavProps {
    modules: Module[];
    onSelectLesson: (moduleId: string, lessonId: string) => void;
}

const moduleIcons = [Book, CircuitBoard, Component, GraduationCap, Wrench];

export const LearnBottomNav = ({ modules, onSelectLesson }: LearnBottomNavProps) => {
    const pathname = usePathname();
    const activeLessonSlug = pathname.split('/').pop();

    const getModuleIdForLesson = (lessonId: string) => {
        if (lessonId === 'final-evaluation') return 'mod-5';
        for (const module of modules) {
            if (module.lessons.some(l => l.id === lessonId)) {
                return module.id;
            }
        }
        return null;
    }
    
    const selectedModuleId = activeLessonSlug ? getModuleIdForLesson(activeLessonSlug) : null;
    
    const navItems = courseData.modules.filter(m => m.id !== 'mod-5');
    const finalExamModule = courseData.modules.find(m => m.id === 'mod-5');

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-sidebar border-t border-sidebar-foreground/20 shadow-lg grid grid-cols-5 items-center justify-around sm:hidden z-50 px-2 gap-1">
           {navItems.map((module, index) => {
                const Icon = moduleIcons[index] || Book;
                const label = `Módulo ${index + 1}`;
                const isSelected = selectedModuleId === module.id;
                
                const [moduleLabel, ...moduleSubtitleParts] = module.title.split(': ');
                const moduleSubtitle = moduleSubtitleParts.join(': ');


                return (
                    <Sheet key={module.id}>
                        <SheetTrigger asChild>
                            <button
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 w-full h-12 rounded-lg transition-all duration-300",
                                    isSelected 
                                        ? "bg-primary text-primary-foreground scale-105" 
                                        : "text-sidebar-foreground/70 hover:bg-primary/10"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-2xs font-medium">{label}</span>
                            </button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[75vh] flex flex-col p-0 rounded-t-2xl">
                             <SheetHeader className="p-4 border-b text-center space-y-0">
                                <SheetTitle className="text-base">{moduleLabel}</SheetTitle>
                                {moduleSubtitle && <SheetDescription className="text-sm -mt-1">{moduleSubtitle}</SheetDescription>}
                            </SheetHeader>
                             <LessonList 
                                module={module}
                                onSelectLesson={onSelectLesson}
                             />
                        </SheetContent>
                    </Sheet>
                )
           })}
            {finalExamModule && (
                 <Sheet>
                    <SheetTrigger asChild>
                         <button
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 w-full h-12 rounded-lg transition-all duration-300",
                                activeLessonSlug === 'final-evaluation'
                                    ? "bg-primary text-primary-foreground scale-105" 
                                    : "text-sidebar-foreground/70 hover:bg-primary/10"
                            )}
                        >
                            <Trophy className="h-5 w-5" />
                            <span className="text-2xs font-medium">Examen</span>
                        </button>
                    </SheetTrigger>
                     <SheetContent side="bottom" className="h-[75vh] flex flex-col p-0 rounded-t-2xl">
                        <SheetHeader className="p-4 border-b text-center space-y-0">
                            <SheetTitle className="text-base">{finalExamModule.title.split(':')[0]}</SheetTitle>
                            <SheetDescription className="text-sm -mt-1">{finalExamModule.title.split(': ')[1]}</SheetDescription>
                        </SheetHeader>
                        <LessonList 
                            module={finalExamModule}
                            onSelectLesson={onSelectLesson}
                         />
                    </SheetContent>
                </Sheet>
            )}
        </nav>
    )
}

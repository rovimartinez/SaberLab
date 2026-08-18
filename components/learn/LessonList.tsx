

'use client';

import type { Module } from "@/lib/data/electricidad-basica";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { useAppState } from "@/hooks/use-learn";
import { usePathname } from "next/navigation";
import { courseData } from "@/lib/data/electricidad-basica";

interface LessonListProps {
    module?: Module;
    onSelectLesson: (moduleId: string, lessonId: string) => void;
}

const LessonStatusIcon = ({ status, number }: { status: "completed" | "current" | "pending", number: string }) => {
    if (status === "completed") {
        return <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />;
    }
     if (status === "current") {
        return (
            <div className="relative w-5 h-5 flex items-center justify-center flex-shrink-0">
                <div className="absolute w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <span className="text-2xs font-bold">{number}</span>
                </div>
            </div>
        );
    }
    return <div className="h-5 w-5 rounded-full border-2 border-slate-300 flex-shrink-0 flex items-center justify-center text-slate-400 text-2xs font-bold">{number}</div>;
};


export const LessonList = ({ module, onSelectLesson }: LessonListProps) => {
    const { completedLessons } = useAppState();
    const pathname = usePathname();
    const activeLessonSlug = pathname.split('/').pop();

    if (!module) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                Selecciona un módulo para ver las lecciones.
            </div>
        )
    }
    
    // Find the starting lesson number for this module
    const moduleIndex = courseData.modules.findIndex(m => m.id === module.id);
    const lessonNumberOffset = courseData.modules
        .slice(0, moduleIndex)
        .reduce((acc, mod) => acc + (mod.id === 'mod-5' ? 0 : mod.lessons.length), 0);

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 pb-4">
            {module.lessons.map((lesson, lessonIndex) => {
                const isCompleted = completedLessons.has(lesson.id);
                let isActive = false;
                if (module.id === 'mod-5') {
                    isActive = activeLessonSlug === 'final-evaluation';
                } else {
                    isActive = activeLessonSlug === lesson.id;
                }
                const status = isCompleted ? "completed" : isActive ? "current" : "pending";
                const lessonNumber = lessonNumberOffset + lessonIndex + 1;
                
                return (
                     <button
                        key={lesson.id}
                        className={cn(
                            "w-full text-left gap-3 p-3 rounded-lg flex items-center transition-colors border",
                            isActive 
                                ? "bg-primary text-primary-foreground border-primary" 
                                : "bg-card hover:bg-muted border-transparent"
                        )}
                        onClick={() => onSelectLesson(module.id, lesson.id)}
                    >
                        <LessonStatusIcon status={status} number={`${lessonNumber}`} />
                        <div className="flex-grow">
                            <p className="font-semibold leading-tight text-xs">{lesson.title}</p>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}

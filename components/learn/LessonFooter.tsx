

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import type { CourseData, Lesson } from '@/lib/data/electricidad-basica';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import { useAppState } from '@/hooks/use-learn';
import { useMemo, useState } from 'react';

interface LessonFooterProps {
    courseData: CourseData;
    currentLessonSlug: string;
    onMarkComplete: (lessonId: string) => Promise<void>;
}

export const LessonFooter = ({ courseData, currentLessonSlug, onMarkComplete }: LessonFooterProps) => {
    const router = useRouter();
    const { completedLessons, showConfetti } = useAppState();
    const [isCompleting, setIsCompleting] = useState(false);
    const isCompleted = completedLessons.has(currentLessonSlug);

    const { previousLesson, nextLesson, isFinalLessonOfCourse, isFinalLessonOfModule } = useMemo(() => {
        const allLessons: Lesson[] = courseData.modules.flatMap(m => m.id !== 'mod-5' ? m.lessons : []);
        let currentModuleLessons: Lesson[] = [];
        const currentModule = courseData.modules.find(m => m.lessons.some(l => l.id === currentLessonSlug));
        if (currentModule) {
            currentModuleLessons = currentModule.lessons;
        }

        const currentIndexInCourse = allLessons.findIndex(l => l.id === currentLessonSlug);
        const currentIndexInModule = currentModuleLessons.findIndex(l => l.id === currentLessonSlug);

        if (currentIndexInCourse === -1) {
            return { previousLesson: null, nextLesson: null, isFinalLessonOfCourse: false, isFinalLessonOfModule: false };
        }

        const prev = currentIndexInCourse > 0 ? allLessons[currentIndexInCourse - 1] : null;
        const next = currentIndexInCourse < allLessons.length - 1 ? allLessons[currentIndexInCourse + 1] : null;
        
        return { 
            previousLesson: prev, 
            nextLesson: next,
            isFinalLessonOfCourse: currentIndexInCourse === allLessons.length - 1,
            isFinalLessonOfModule: currentModule ? currentIndexInModule === currentModule.lessons.length - 1 : false,
        };
    }, [courseData, currentLessonSlug]);

    
    const handleNavigate = (lesson: Lesson | null) => {
        if (lesson) {
            router.push(`/learn/${lesson.id}`);
        }
    };
    
    const handleCompleteAndAdvance = async () => {
        setIsCompleting(true);
        await onMarkComplete(currentLessonSlug);

        // La animación y la navegación se manejan en el layout cuando `showConfetti` se activa.
        // Si no es la última lección del módulo, navegamos después de un breve retraso.
        if (!isFinalLessonOfModule) {
            setTimeout(() => {
                if (nextLesson) {
                    handleNavigate(nextLesson);
                } else if (isFinalLessonOfCourse) {
                    router.push('/learn/final-evaluation');
                }
                setIsCompleting(false);
            }, 1200); 
        } else {
             // Si es la última lección de un módulo, la animación de confeti se activará.
             // La navegación se gestionará en `learn/layout.tsx` al terminar la animación.
             // Solo necesitamos resetear el estado del botón aquí.
             setTimeout(() => {
                setIsCompleting(false);
             }, 1200);
        }
    };


    return (
        <div className="mt-8 mb-4 pt-6 border-t">
            <div className="flex justify-between items-center">
                <Button
                    onClick={() => handleNavigate(previousLesson)}
                    disabled={!previousLesson || isCompleting || showConfetti}
                    variant={previousLesson ? "outline" : "outline"}
                    size="sm"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                </Button>

                 <Button
                    onClick={handleCompleteAndAdvance}
                    disabled={isCompleting || isCompleted || showConfetti}
                    size="sm"
                    className={cn(
                        "relative overflow-hidden",
                        isCompleting && "btn-progress-animate text-white",
                        isCompleted && !isCompleting && "bg-green-600 hover:bg-green-700"
                    )}
                >
                    <span className="relative z-10 flex items-center">
                         {isCompleting ? (
                            <>
                                Completando...
                            </>
                        ) : isCompleted ? (
                            <>
                                Completada
                                {(!isFinalLessonOfCourse && !isFinalLessonOfModule) && <ArrowRight className="ml-2 h-4 w-4" />}
                            </>
                        ) : (
                            <>
                                Completar
                                {(!isFinalLessonOfCourse && !isFinalLessonOfModule) && <ArrowRight className="ml-2 h-4 w-4" />}
                            </>
                        )}
                    </span>
                </Button>
            </div>
             <div className={cn("hidden sm:block pt-6")}>
                <Separator/>
            </div>
        </div>
    )
}

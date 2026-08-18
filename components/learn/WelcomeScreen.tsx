

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Wrench, ArrowRight, CheckCircle, Trophy, Sparkles } from "lucide-react";
import { courseData } from "@/lib/data/electricidad-basica";
import { useAppState } from "@/hooks/use-learn";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import type { Lesson } from "@/lib/data/electricidad-basica";

export const WelcomeScreen = ({ isMobile }: { isMobile?: boolean }) => {
    const { completedLessons } = useAppState();
    const router = useRouter();

    const allLessons: Lesson[] = useMemo(() => courseData.modules.flatMap(m => m.id === 'mod-5' ? [] : m.lessons), []);
    const totalLessons = allLessons.length;
    const progressPercentage = totalLessons > 0 ? (completedLessons.size / totalLessons) * 100 : 0;
    
    const unlockedToolsCount = useMemo(() => {
        return (courseData.tools || []).filter(tool => tool.unlocksWithLessonId && completedLessons.has(tool.unlocksWithLessonId)).length;
    }, [completedLessons]);
    
    const nextLesson = useMemo(() => {
        return allLessons.find(lesson => !completedLessons.has(lesson.id));
    }, [allLessons, completedLessons]);

    const handleContinue = () => {
        if (nextLesson) {
            router.push(`/learn/${nextLesson.id}`);
        } else {
            // If all lessons are complete, maybe go to a final page or dashboard
            router.push('/learn/final-evaluation');
        }
    };
    
    const stats = [
        { label: "Lecciones Completadas", value: `${completedLessons.size} / ${totalLessons}`, icon: CheckCircle },
        { label: "Herramientas Obtenidas", value: unlockedToolsCount, icon: Wrench },
        { label: "Certificado", value: progressPercentage >= 100 ? "¡Obtenido!" : "En Progreso", icon: Trophy }
    ];

    const motivationalMessage = useMemo(() => {
        if (progressPercentage === 0) return "¡Todo gran viaje comienza con un primer paso!";
        if (progressPercentage <= 25) return "¡Excelente comienzo! Sigue así.";
        if (progressPercentage <= 50) return "¡Vas por la mitad! No te detengas ahora.";
        if (progressPercentage <= 75) return "¡Ya casi lo logras! Estás en la recta final.";
        if (progressPercentage < 100) return "¡Impresionante! Un último esfuerzo.";
        return "¡Felicidades! ¡Has completado el curso!";
    }, [progressPercentage]);
    
    const buttonText = useMemo(() => {
        if (completedLessons.size === 0) {
            return 'Empezar Curso';
        }
        if (nextLesson) {
            return 'Continuar Aprendiendo';
        }
        return 'Ir a Evaluación Final';
    }, [completedLessons, nextLesson]);


    return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-card rounded-lg border-2 border-dashed p-6 sm:p-12 animate-fade-in-up space-y-6">
            <div className="p-4 bg-primary/10 rounded-full">
                 <Sparkles className="h-12 w-12 text-primary" />
            </div>
            
            <div>
                 <h2 className="text-2xl font-bold font-headline">Bienvenido al curso</h2>
                 <h1 className="text-3xl font-extrabold text-primary">{courseData.title}</h1>
            </div>

            <div className="w-full max-w-md space-y-4">
                 <div className="flex justify-between items-center text-sm font-medium text-muted-foreground px-1">
                    <span>Progreso del Curso</span>
                    <span className="font-bold text-primary">{Math.round(progressPercentage)}%</span>
                 </div>
                 <Progress value={progressPercentage} className="h-3" />
                 <div className="text-center mt-2">
                    <p className="text-sm font-semibold text-muted-foreground">{motivationalMessage}</p>
                    <p className="text-xs text-muted-foreground">Has completado {completedLessons.size} de {totalLessons} lecciones.</p>
                </div>
                 <Button onClick={handleContinue} size="lg" className="w-full !mt-4">
                    {buttonText}
                    <ArrowRight className="ml-2"/>
                </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                {stats.map(stat => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label} className="bg-background/50">
                            <CardContent className="p-4 flex flex-col items-center gap-2">
                                <Icon className="h-6 w-6 text-muted-foreground"/>
                                <p className="text-xs text-muted-foreground font-semibold">{stat.label}</p>
                                <p className="text-lg font-bold">{stat.value}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
            
            {!isMobile && (
                <p className="text-xs text-muted-foreground pt-4">O selecciona una lección del panel de la izquierda.</p>
            )}
        </div>
    );
};

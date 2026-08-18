

'use client';

import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { CheckCircle, Circle, PanelLeft, Zap, ArrowLeft, Wrench, Lock, LucideIcon, Trophy, FileText, Home, BookOpen, ChevronLeft, Pin, PinOff } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import type { CourseData, Module } from "@/lib/data/electricidad-basica";
import { Progress } from "./ui/progress";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { Separator } from "./ui/separator";
import { useState, lazy } from "react";
import Link from "next/link";
import { UserProfile } from "./UserProfile";
import type { NavLink } from "@/lib/types";
import * as LucideIcons from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import Image from 'next/image';
import { useAuth } from "@/hooks/use-auth";
import { tools } from "@/lib/tools";
import { useSidebar } from "./ui/sidebar";
import { useAppState } from "@/hooks/use-learn";
import { appConfig } from "@/lib/config";


// Hack para obtener componentes de íconos de lucide-react usando un string.
const icons = LucideIcons as unknown as { [key: string]: LucideIcon };

// Define las propiedades que el componente CourseSidebar espera recibir.
interface CourseSidebarProps {
  courseData: CourseData; // Los datos completos del curso (módulos, lecciones, etc.).
  onSelectLesson: (moduleId: string, lessonId: string) => void; // Función para manejar la selección de una lección.
  isMobile?: boolean; // Indica si se está renderizando en un dispositivo móvil.
}

/**
 * Componente `LessonStatusIcon`: Muestra el ícono para cada lección.
 * Cambia su apariencia (círculo o rectángulo) y contenido según si la lección
 * está completada, es la actual o está pendiente, y si el panel está abierto.
 */
const LessonStatusIcon = ({ status, number }: { status: "completed" | "current" | "pending"; number: string; }) => {
    
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
    
    // Si la lección está pendiente, muestra un círculo con el número.
    const shapeClass = "rounded-full w-5 h-5";
    return (
        <div className={cn("flex items-center justify-center bg-module-background text-secondary-foreground text-2xs font-bold flex-shrink-0", shapeClass)}>
            {number}
        </div>
    );
};


// Componente principal del panel lateral del curso.
export function CourseSidebar({
  courseData,
  onSelectLesson,
  isMobile = false,
}: CourseSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { completedLessons } = useAppState();
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const { user } = useAuth();
  const { open, setOpen, isHovered, setIsHovered } = useSidebar();
  const isExpanded = open || isHovered;

  const activeLessonSlug = pathname.split('/').pop();
  
  const finalIsOpen = isMobile ? true : isExpanded;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };
  
  const handleModuleClick = (module: Module) => {
    if (module.id === 'mod-5') {
        router.push(`/learn/final-evaluation`);
        return;
    }
    setActiveModule(module);
  }

  const handleBackClick = () => {
      setActiveModule(null);
  }

  const handleMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    // Check if the mouse is leaving to go into a dropdown menu
    if (event.currentTarget.querySelector('[data-state="open"]')) {
      return;
    }
    setIsHovered(false);
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 border-r bg-sidebar text-sidebar-foreground flex-col flex transition-all duration-300 ease-in-out",
        isMobile ? "w-full" : (isExpanded ? "w-72" : "w-20")
      )}
      onMouseEnter={!isMobile ? () => setIsHovered(true) : undefined}
      onMouseLeave={!isMobile ? handleMouseLeave : undefined}
      onClick={!isExpanded && !isMobile ? () => setOpen(true) : undefined}
    >
      <div className="p-4">
        <div className={cn("flex items-center gap-2", isExpanded ? "justify-between" : "justify-center")}>
            {isExpanded ? (
                 <Button variant="ghost" size="icon" asChild className="text-sidebar-foreground hover:text-sidebar-foreground hover:bg-primary/10">
                    <Link href="/dashboard">
                        <ChevronLeft className="h-5 w-5" />
                        <span className="sr-only">Volver al Dashboard</span>
                    </Link>
                </Button>
            ) : (
                <Link href="/" className="flex items-center gap-2 group justify-center">
                    <Image 
                        src="https://i.postimg.cc/y85SkNRx/Circuit-Hub-Logo.png"
                        alt={`${appConfig.title} Logo`}
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0"
                    />
                </Link>
            )}
            
            {isExpanded && (
                 <h1 className="text-md font-bold font-headline leading-tight flex-1 text-center line-clamp-2 group-hover:text-primary transition-colors">{courseData.title}</h1>
            )}

            {!isMobile && isExpanded && (
                <Button variant="ghost" size="icon" onClick={handleToggle} className="text-sidebar-foreground hover:text-sidebar-foreground hover:bg-primary/10">
                  {open ? <Pin /> : <PinOff />}
                  <span className="sr-only">{open ? 'Desfijar panel' : 'Fijar panel'}</span>
                </Button>
            )}
        </div>
      </div>
      <Separator className="my-0 bg-sidebar-foreground/20" />


      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-2 py-4 space-y-1">
        <AnimatePresence>
          {courseData.modules.map((module, moduleIndex) => {
              const isFinalEvaluation = module.id === 'mod-5';
              const isActiveModule = activeModule?.id === module.id;
              
              if (activeModule && !isActiveModule) {
                  return null; // Oculta los demás módulos cuando uno está activo
              }
              
              const lessonsInModule = isFinalEvaluation ? 1 : module.lessons.length;
              const completedInModule = module.lessons.filter((l) => completedLessons.has(l.id)).length;
              const moduleProgress = lessonsInModule > 0 ? (completedInModule / lessonsInModule) * 100 : 0;
              
              return (
                   <motion.div key={module.id} layout="position" transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                      <TooltipProvider>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <Button 
                                      className={cn(
                                        "w-full h-auto text-left justify-start text-secondary-foreground transition-all duration-300",
                                        "hover:brightness-110",
                                        "bg-module-background progress-bar-bg",
                                        finalIsOpen ? "py-1.5 px-2" : "p-2 justify-center"
                                      )}
                                      style={{ '--progress-percent': `${moduleProgress}%` } as React.CSSProperties}
                                      onClick={() => isActiveModule ? handleBackClick() : handleModuleClick(module)}
                                  >
                                      <div className="relative z-10 w-full flex items-center justify-between gap-2">
                                          {isActiveModule && <ArrowLeft className="h-4 w-4 shrink-0" />}
                                          {finalIsOpen ? (
                                              <>
                                                  <p className="font-semibold truncate text-2xs text-secondary-foreground flex-1">{module.title}</p>
                                                  {moduleProgress > 0 && (
                                                      <span className="text-2xs font-bold text-secondary-foreground/80 ml-2">
                                                          {Math.round(moduleProgress)}%
                                                      </span>
                                                  )}
                                              </>
                                          ) : (
                                              <div className="flex items-center justify-center w-full h-6">
                                                  {isFinalEvaluation ? <Trophy className="h-5 w-5 text-secondary-foreground" /> : <span className="font-bold text-sm text-secondary-foreground">M{moduleIndex + 1}</span>}
                                              </div>
                                          )}
                                      </div>
                                  </Button>
                              </TooltipTrigger>
                               {!finalIsOpen && (
                                  <TooltipContent side="right">
                                      <p>{module.title}</p>
                                  </TooltipContent>
                              )}
                          </Tooltip>
                      </TooltipProvider>

                      <AnimatePresence>
                          {isActiveModule && (
                              <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3, ease: "easeInOut" }}
                                  className="space-y-1 mt-1 overflow-hidden"
                              >
                                  {module.lessons.map((lesson, lessonIndex) => {
                                      const isCompleted = completedLessons.has(lesson.id);
                                      const isActiveLesson = activeLessonSlug === lesson.id;
                                      const status = isCompleted ? "completed" : isActiveLesson ? "current" : "pending";
                                      const lessonNumberInCourse = courseData.modules
                                          .slice(0, moduleIndex)
                                          .reduce((acc, mod) => acc + (mod.id === 'mod-5' ? 0 : mod.lessons.length), 0) + lessonIndex + 1;

                                      return (
                                          <TooltipProvider key={lesson.id}>
                                              <Tooltip>
                                                  <TooltipTrigger asChild>
                                                      <Button
                                                          variant={isActiveLesson ? "secondary" : "ghost"}
                                                          className={cn(
                                                              "w-full h-auto text-left gap-3",
                                                              !isActiveLesson && "text-sidebar-foreground hover:bg-primary/10 hover:text-sidebar-foreground",
                                                              finalIsOpen ? "py-1.5 px-4 justify-start" : "h-auto py-2 px-2 justify-center"
                                                          )}
                                                          onClick={() => onSelectLesson(module.id, lesson.id)}
                                                      >
                                                          <LessonStatusIcon 
                                                              status={status} 
                                                              number={`${lessonNumberInCourse}`}
                                                          />
                                                          {finalIsOpen && (
                                                              <div className="text-left w-full">
                                                                  <p className="font-medium leading-tight text-xs">{lesson.title}</p>
                                                              </div>
                                                          )}
                                                      </Button>
                                                  </TooltipTrigger>
                                                  {!finalIsOpen && (
                                                      <TooltipContent side="right">
                                                          <p>{lesson.title}</p>
                                                      </TooltipContent>
                                                  )}
                                              </Tooltip>
                                          </TooltipProvider>
                                      );
                                  })}
                              </motion.div>
                          )}
                      </AnimatePresence>
                   </motion.div>
              )
          })}
        </AnimatePresence>
      </div>
      
      <div className="mt-auto p-2">
        <Separator className="my-2 bg-sidebar-foreground/20" />
         <div className={cn(
            "flex items-center w-full rounded-lg text-left transition-colors",
            !isExpanded && 'justify-center'
        )}>
            <UserProfile showName={isExpanded} />
        </div>
      </div>
    </aside>
  );
}

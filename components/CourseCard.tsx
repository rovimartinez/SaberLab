

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, BookOpen, ChevronRight, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { useAppState } from '@/hooks/use-learn';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const courses = [
  {
    title: 'Electricidad Básica',
    description: 'Comprende los principios fundamentales, desde la carga eléctrica hasta los circuitos simples y la Ley de Ohm.',
    href: '/course/electricidad-basica',
    id: 'electricidad-basica',
    learnHref: '/learn',
    imageUrl: 'https://i.postimg.cc/02rvtFjb/Electricidad-Basica.png',
    imageHint: 'electrical circuit components',
    category: 'Electricidad',
    author: 'SaberLabs',
    authorAvatar: 'https://i.postimg.cc/y85SkNRx/Circuit-Hub-Logo.png',
    level: 'Principiante',
    modules: 5,
    status: 'published'
  },
  {
    title: 'Electrónica Fundamental',
    description: 'Explora componentes como resistencias, condensadores y transistores para construir y analizar circuitos más complejos.',
    href: '/course/electronica-fundamental',
    id: 'electronica-fundamental',
    learnHref: '/learn',
    imageUrl: 'https://i.postimg.cc/zDSqHJv8/Chat-GPT-Image-8-sept-2025-11-50-10.png',
    imageHint: 'electronic components',
    category: 'Electrónica',
    author: 'SaberLabs',
    authorAvatar: 'https://i.postimg.cc/y85SkNRx/Circuit-Hub-Logo.png',
    level: 'Intermedio',
    modules: 12,
    status: 'published'
  },
];

type Course = (typeof courses)[0];

const CourseBadges = ({ course, isEnrolled }: { course: Course, isEnrolled: boolean }) => {
    const isConstruction = course.status === 'construction';

    if (isConstruction) {
        return <Badge variant="secondary" className="absolute top-2 left-2 z-10">En Construcción</Badge>;
    }
    if (isEnrolled) {
        return (
            <Badge variant="secondary" className="absolute top-2 right-2 z-10 bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="mr-1 h-3 w-3" />
                Inscrito
            </Badge>
        );
    }
    return <Badge className="absolute top-2 right-2 z-10">{course.level}</Badge>;
}

export const CourseCard = ({ course, isEnrolled = false }: { course: Course, isEnrolled?: boolean }) => {
    const isConstruction = course.status === 'construction';
    const { enrollInCourse, loading } = useAppState();
    const router = useRouter();
    const { toast } = useToast();
    const finalHref = isConstruction ? '#' : (isEnrolled ? course.learnHref : course.href);

    const handleEnroll = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        await enrollInCourse(course.id);
        
        toast({
            variant: "success",
            title: "¡Inscripción Exitosa!",
            description: `Ahora estás inscrito en ${course.title}.`,
        });

        router.push('/my-courses');
    };
    
    return (
        <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 relative group">
             <Link 
                href={finalHref} 
                className={cn(isConstruction && "opacity-60 cursor-not-allowed")}
                aria-disabled={isConstruction}
                onClick={(e) => isConstruction && e.preventDefault()}
            >
                <CourseBadges course={course} isEnrolled={isEnrolled} />
                <div className="w-full h-40 bg-secondary relative">
                    <Image 
                        src={course.imageUrl}
                        alt={`Portada del curso ${course.title}`}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        data-ai-hint={course.imageHint}
                    />
                </div>
            </Link>
            <CardContent className="p-4 flex flex-col flex-grow">
                 <Link 
                    href={finalHref} 
                    className={cn("flex-grow", isConstruction && "opacity-60 cursor-not-allowed")}
                    aria-disabled={isConstruction}
                    onClick={(e) => isConstruction && e.preventDefault()}
                >
                    <p className="text-sm text-muted-foreground mt-1">{course.category}</p>
                    <h3 className="text-base font-semibold leading-snug group-hover:text-primary transition-colors mt-1">
                        {course.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <BookOpen className="w-4 h-4"/>
                        <span>{course.modules} Módulos</span>
                    </div>
                </Link>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                         <Avatar className="h-6 w-6">
                            <AvatarImage src={course.authorAvatar} alt={course.author} />
                            <AvatarFallback>{course.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{course.author}</span>
                    </div>
                    {!isEnrolled && !isConstruction && (
                        <Button 
                            size="sm" 
                            className="text-xs h-7 px-2"
                            onClick={handleEnroll}
                            disabled={loading}
                        >
                            <PlusCircle className="mr-1 h-3 w-3" />
                            Inscribirse
                        </Button>
                    )}
                    {isEnrolled && !isConstruction && (
                        <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs h-7 px-2"
                            asChild
                        >
                           <Link href={course.learnHref}>
                             Ir al Curso
                           </Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};


"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, XCircle, RefreshCw, Lightbulb, Trophy } from 'lucide-react';
import type { QuizQuestion } from '@/lib/types';
import { cn } from '@/lib/utils';
import { topicQuizzes } from '@/lib/quiz';
import { Progress } from './ui/progress';

const QUESTION_COUNT = 5;

type QuizState = 'not_started' | 'in_progress' | 'finished';

interface QuizSectionProps {
  topicSlug: string;
}

export function QuizSection({ topicSlug }: QuizSectionProps) {
    const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
    const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
    const [quizState, setQuizState] = useState<QuizState>('not_started');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    useEffect(() => {
        const topicQuestions = topicQuizzes[topicSlug] || [];
        setAllQuestions(topicQuestions);
        // Reset everything when topic changes
        setQuizState('not_started');
        setActiveQuestions([]);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setSelectedAnswer(null);
        setIsAnswered(false);
    }, [topicSlug]);
    
    const score = useMemo(() => {
        return userAnswers.reduce((correctCount, answer, index) => {
            if (activeQuestions[index] && answer === activeQuestions[index].correctAnswer) {
                return correctCount + 1;
            }
            return correctCount;
        }, 0);
    }, [userAnswers, activeQuestions]);

    const handleStartQuiz = () => {
        // Shuffle and pick 5 questions
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.min(QUESTION_COUNT, shuffled.length));
        
        setActiveQuestions(selected);
        setUserAnswers(new Array(selected.length).fill(null));
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setQuizState('in_progress');
    };
    
    const handleAnswerSelect = (option: string) => {
        if (isAnswered) return;
        
        setSelectedAnswer(option);
        setIsAnswered(true);

        const newUserAnswers = [...userAnswers];
        newUserAnswers[currentQuestionIndex] = option;
        setUserAnswers(newUserAnswers);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < activeQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setQuizState('finished');
        }
    };
    
    const currentQuestion = activeQuestions[currentQuestionIndex];

    if (allQuestions.length < QUESTION_COUNT) {
        return null; // Don't render quiz if there aren't enough questions
    }
    
    if (quizState === 'not_started') {
        return (
             <Card className="shadow-lg bg-secondary/50">
                <CardHeader className='text-center items-center pb-4'>
                    <div className="p-3 bg-primary/10 rounded-full mb-2">
                        <Trophy className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-xl">Pon a Prueba tu Conocimiento</CardTitle>
                    <CardDescription className="text-sm max-w-sm">
                        Realiza una breve prueba de {QUESTION_COUNT} preguntas para afianzar lo que has aprendido en esta lección.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-6">
                    <Button onClick={handleStartQuiz} size="lg">
                        <Lightbulb className="mr-2" />
                        Comenzar Prueba
                    </Button>
                </CardContent>
            </Card>
        );
    }
    
    if (quizState === 'finished') {
        return (
             <Card className="shadow-lg text-center">
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center justify-center gap-2">
                        <Trophy className='text-yellow-500' />
                        ¡Prueba Completada!
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Este es tu resultado. ¡Puedes intentarlo de nuevo para mejorar tu puntaje!
                    </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                    <p className='text-4xl font-bold'>
                        Obtuviste <span className='text-primary'>{score}</span> de <span className='text-primary'>{activeQuestions.length}</span> correctas
                    </p>
                    <Button onClick={handleStartQuiz}>
                        <RefreshCw className="mr-2" />
                        Intentar de Nuevo
                    </Button>
                </CardContent>
            </Card>
        )
    }


    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-base">Pregunta {currentQuestionIndex + 1} de {activeQuestions.length}</CardTitle>
                 <Progress value={((currentQuestionIndex + 1) / activeQuestions.length) * 100} className="mt-2" />
            </CardHeader>
            <CardContent>
                {currentQuestion && (
                    <div className="space-y-6">
                        <p className="text-lg font-medium">{currentQuestion.question}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentQuestion.options.map((option) => (
                                <Button
                                    key={option}
                                    variant="outline"
                                    className={cn(
                                        "justify-start h-auto py-3 whitespace-normal",
                                        isAnswered && option === currentQuestion.correctAnswer && 'bg-green-500/20 border-green-500 hover:bg-green-500/30 text-foreground',
                                        isAnswered && option === selectedAnswer && option !== currentQuestion.correctAnswer && 'bg-red-500/20 border-red-500 hover:bg-red-500/30 text-foreground'
                                    )}
                                    onClick={() => handleAnswerSelect(option)}
                                    disabled={isAnswered}
                                >
                                    {isAnswered && option === currentQuestion.correctAnswer && <CheckCircle className="mr-2 text-green-700"/>}
                                    {isAnswered && option === selectedAnswer && option !== currentQuestion.correctAnswer && <XCircle className="mr-2 text-red-700"/>}
                                    {option}
                                </Button>
                            ))}
                        </div>

                        {isAnswered && (
                            <div className={cn(
                                "p-4 rounded-md",
                                selectedAnswer === currentQuestion.correctAnswer ? 'bg-green-500/10' : 'bg-red-500/10'
                            )}>
                               <p className='font-bold flex items-center gap-2'>
                                  {selectedAnswer === currentQuestion.correctAnswer 
                                    ? <><CheckCircle className='text-green-700'/> ¡Correcto!</> 
                                    : <><XCircle className='text-red-700'/> Incorrecto</>}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">{currentQuestion.explanation}</p>
                            </div>
                        )}
                        
                        <div className='text-center'>
                             {isAnswered && (
                                 <Button onClick={handleNextQuestion}>
                                    {currentQuestionIndex < activeQuestions.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Prueba'}
                                 </Button>
                             )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

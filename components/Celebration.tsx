
'use client';

import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';


interface CelebrationProps {
    show: boolean;
    onComplete: () => void;
}

export function Celebration({ show, onComplete }: CelebrationProps) {
  const { width, height } = useWindowSize();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return null;
  }

  return (
    <div 
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 9999 }}
    >
       <AnimatePresence>
            {show && (
                <>
                    <Confetti
                        width={width}
                        height={height}
                        recycle={false}
                        numberOfPieces={500}
                        gravity={0.12}
                        onConfettiComplete={onComplete}
                        className="!z-[9999]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5, ease: "backOut" }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center"
                    >
                         <div className="p-8 bg-background/80 backdrop-blur-sm rounded-2xl shadow-2xl flex flex-col items-center gap-4">
                            <Trophy className="h-16 w-16 text-yellow-400 drop-shadow-lg" />
                            <h2 className="text-3xl font-extrabold tracking-tight font-headline text-primary">
                                ¡Módulo Completado!
                            </h2>
                            <p className="text-muted-foreground">¡Excelente trabajo! Sigue así.</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    </div>
  );
}

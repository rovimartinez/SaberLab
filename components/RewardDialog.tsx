
'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { NavLink } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Trophy, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RewardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tool: NavLink | null;
}

const SuperWinBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-background/50 to-background" />
        <div 
            className="absolute inset-0 bg-repeat"
            style={{
                backgroundImage: 'radial-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px)',
                backgroundSize: '1rem 1rem',
                maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 60%)',
            }}
        />
        <div 
             className="absolute inset-[-100%] animate-[spin_20s_linear_infinite]"
             style={{
                backgroundImage: 'conic-gradient(from 90deg at 50% 50%, hsl(var(--primary)) 0%, transparent 25%, transparent 75%, hsl(var(--primary)) 100%)',
                opacity: 0.15,
             }}
        />
    </div>
)


export function RewardDialog({ isOpen, onClose, tool }: RewardDialogProps) {
  if (!tool) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden p-0 border-primary/50">
         <SuperWinBackground />
        <div className="relative flex flex-col items-center text-center p-6 pt-8 z-10">
          <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-400/20">
            <Trophy className="h-12 w-12 text-yellow-400 drop-shadow-lg" />
          </div>
          <h2 className="text-2xl font-bold mt-4">¡Recompensa Desbloqueada!</h2>

          <div className="my-6 flex flex-col items-center gap-4">
            <div className="relative w-28 h-28 bg-background rounded-full p-1 animate-pulse-glow">
              <Image
                src={tool.imageUrl || ''}
                alt={tool.label}
                width={112}
                height={112}
                className="rounded-full object-cover shadow-lg border-4 border-background"
              />
            </div>
            <div className="text-center mt-4">
                <h3 className="text-xl font-bold text-primary">{tool.label}</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">{tool.description}</p>
            </div>
          </div>

          <DialogFooter className="w-full">
             <Button asChild className="w-full" onClick={onClose} size="lg">
                <Link href={tool.href}>Ir a la Herramienta</Link>
             </Button>
          </DialogFooter>
        </div>
         <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-20">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

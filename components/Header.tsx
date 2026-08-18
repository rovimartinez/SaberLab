'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { appConfig } from '@/lib/config';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { UserProfile } from './UserProfile';
import { ClientOnly } from './ClientOnly';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  showPlansLink?: boolean;
}

export function Header({ showPlansLink = false }: HeaderProps) {
  const isMobile = useIsMobile();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="https://i.postimg.cc/y85SkNRx/Circuit-Hub-Logo.png"
              alt={`${appConfig.title} Logo`}
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-lg font-bold transition-colors group-hover:text-primary/80">
              {appConfig.title}
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="#courses"
              className={cn(
                'text-sm font-medium transition-colors',
                'text-sidebar-foreground/80 hover:text-sidebar-foreground'
              )}
            >
              Cursos
            </Link>
            {showPlansLink && (
              <Link
                href="#plans"
                className={cn(
                  'text-sm font-medium transition-colors',
                  'text-sidebar-foreground/80 hover:text-sidebar-foreground'
                )}
              >
                Planes
              </Link>
            )}
            <Link
              href="#experts"
              className={cn(
                'text-sm font-medium transition-colors',
                'text-sidebar-foreground/80 hover:text-sidebar-foreground'
              )}
            >
              Creador
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center justify-end space-x-2">
            <ClientOnly>
                <UserProfile showName={true} />
            </ClientOnly>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle asChild>
                  <Link href="/" className="flex items-center gap-2 group">
                    <Image
                      src="https://i.postimg.cc/y85SkNRx/Circuit-Hub-Logo.png"
                      alt={`${appConfig.title} Logo`}
                      width={32}
                      height={32}
                      className="h-8 w-8"
                    />
                    <span className="text-lg font-bold transition-colors group-hover:text-primary/80">
                      {appConfig.title}
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <nav className="grid gap-2">
                  <Link
                    href="#courses"
                    className="text-lg font-medium hover:text-primary"
                  >
                    Cursos
                  </Link>
                  {showPlansLink && (
                    <Link
                      href="#plans"
                      className="text-lg font-medium hover:text-primary"
                    >
                      Planes
                    </Link>
                  )}
                  <Link
                    href="#experts"
                    className="text-lg font-medium hover:text-primary"
                  >
                    Creador
                  </Link>
                </nav>
                <div className="flex flex-col gap-2 pt-4 border-t">
                    <ClientOnly>
                        <UserProfile showName={true} isMobile={isMobile}/>
                    </ClientOnly>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

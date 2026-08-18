'use client';

import { type User } from "firebase/auth";
import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { appConfig } from "@/lib/config";
import { IdCardPattern } from "@/components/IdCardPattern";
import { ShieldCheck, Crown, BookOpen, MessageSquare, Gem } from "lucide-react";
import { Button } from "../ui/button";

interface IdCardProps {
    user: User;
    rank: { name: string; color: string };
    isFlipped: boolean;
    onClick: () => void;
}

const premiumBenefits = [
    { icon: BookOpen, text: "Acceso a todos los cursos" },
    { icon: MessageSquare, text: "Asesorías Personalizadas" },
    { icon: Gem, text: "Contenido Exclusivo" },
];

const getInitials = (nameStr: string | null) => {
    if (!nameStr) return 'U';
    return nameStr.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}


export function IdCard({ user, rank, isFlipped, onClick }: IdCardProps) {
    const rankStyle = {
      '--rank-gradient-start': rank.color,
      '--rank-gradient-end': '#FFFFFF',
    } as React.CSSProperties;

    return (
        <div style={{ perspective: '1000px' }} onClick={onClick} className="cursor-pointer">
            <motion.div
                className="w-full h-[320px] sm:h-[280px] shadow-2xl rounded-2xl relative"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* --- CARD FRONT --- */}
                <div
                    className="absolute w-full h-full rounded-2xl overflow-hidden"
                    style={{ 
                        ...rankStyle, 
                        backfaceVisibility: 'hidden', 
                        WebkitBackfaceVisibility: 'hidden', 
                        backgroundImage: 'linear-gradient(135deg, var(--rank-gradient-start) 0%, hsl(var(--card)) 60%)'
                    }}
                >
                    <Card 
                        className="w-full h-full mx-auto border-0 flex flex-col bg-transparent"
                    >
                         <CardHeader className="p-4 border-b border-black/10">
                            <div className="flex items-center gap-3">
                                <Image
                                    src="https://i.postimg.cc/y85SkNRx/Circuit-Hub-Logo.png"
                                    alt={`${appConfig.title} Logo`}
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 filter invert-[.25]"
                                />
                                <div>
                                    <h2 className="font-bold text-sm uppercase tracking-wider text-black/80">SaberLabs</h2>
                                    <p className="text-xs text-black/60">MEMBER ID CARD</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 relative flex flex-col flex-grow">
                            <IdCardPattern />
                            <div className="relative flex flex-col sm:flex-row gap-4 items-center sm:items-start flex-grow">
                                <div className="flex flex-col items-center sm:items-start">
                                    <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'Usuario'} />
                                        <AvatarFallback className="text-2xl">{getInitials(user.displayName)}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex-grow space-y-2 text-center sm:text-left mt-2 sm:mt-0">
                                    <div>
                                        <p className="text-2xs sm:text-xs text-black/60 uppercase tracking-wider">Nombre</p>
                                        <p className="text-sm sm:text-base font-medium text-foreground truncate">{user.displayName || 'Sin nombre'}</p>
                                    </div>
                                    <div>
                                        <p className="text-2xs sm:text-xs text-black/60 uppercase tracking-wider">Email</p>
                                        <p className="text-sm sm:text-base font-medium text-foreground truncate">{user.email || 'No disponible'}</p>
                                    </div>
                                    <div>
                                        <p className="text-2xs sm:text-xs text-black/60 uppercase tracking-wider">RANGO</p>
                                        <p className="text-sm sm:text-base font-medium text-foreground truncate flex items-center justify-center sm:justify-start gap-2"><ShieldCheck className="h-4 w-4" style={{ color: rank.color }}/> {rank.name}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative flex justify-between items-end mt-auto pt-4">
                                <div>
                                    <p className="text-2xs text-foreground/80">Miembro desde</p>
                                    <p className="font-semibold text-foreground text-xs">{user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-2xs text-foreground/70">ID-{user.uid.substring(0, 12).toUpperCase()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* --- CARD BACK --- */}
                <div
                    className="absolute w-full h-full rounded-2xl overflow-hidden flex flex-col"
                    style={{
                        ...rankStyle,
                        backgroundImage: 'linear-gradient(135deg, var(--rank-gradient-start) 0%, hsl(var(--card)) 60%)',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                    }}
                >
                    <div className="h-12 bg-black mt-8"></div>
                    <Card className="w-full flex-grow bg-card border-0 p-4 flex flex-col justify-center items-center space-y-3 rounded-t-none">
                        <h3 className="font-bold text-sm text-center uppercase flex items-center gap-2">
                            <Crown className="text-yellow-400"/> Beneficios Premium
                        </h3>
                        <ul className="space-y-2 text-sm text-left w-full max-w-xs">
                            {premiumBenefits.map((benefit, index) => {
                                const Icon = benefit.icon;
                                return (
                                     <li key={index} className="flex items-center gap-3 p-2 bg-background/80 rounded-md">
                                        <Icon className="h-5 w-5 text-primary" />
                                        <span className="text-foreground">{benefit.text}</span>
                                    </li>
                                )
                            })}
                        </ul>
                        <Button variant="link" className="text-primary font-bold mt-2">
                            Hacerse Premium
                        </Button>
                    </Card>
                </div>
            </motion.div>
         </div>
    )
}


"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  isHovered: boolean;
  setIsHovered: (hovered: boolean) => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    return (
        <SidebarContext.Provider value={{ open, setOpen, isHovered, setIsHovered }}>
            {children}
        </SidebarContext.Provider>
    );
}

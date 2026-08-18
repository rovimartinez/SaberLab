
"use client";

import { appConfig } from "@/lib/config";
import { SocialLinks } from "./SocialLinks";

export function Footer() {

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <SocialLinks />
        <p className="text-sm mt-6">
          © {new Date().getFullYear()} — {appConfig.title} es un proyecto educativo de{" "}
          <a 
            href="https://www.instagram.com/ronnymartinez.23" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Ronny Martinez
          </a>
        </p>
      </div>
    </footer>
  );
}

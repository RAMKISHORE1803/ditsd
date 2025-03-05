import Link from "next/link";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import HeaderAuth from "@/components/header-auth";
import { Menu, X, Map, Info, Zap } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full flex justify-center h-16 fixed top-0 z-50 bg-background/90 backdrop-blur-md shadow-lg">
      <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5">
        <div className="flex gap-5 items-center">
          <Link href={"/"} className="flex items-center">
            <div className="relative">
              <span className="font-bold text-xl bg-gradient-to-r from-[hsl(var(--uganda-gold))] to-amber-500 bg-clip-text text-transparent">Uganda</span>
              <span className="font-bold text-lg ml-2 relative">
                Digital Mapping
                <div className="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-[hsl(var(--uganda-gold))] to-transparent"></div>
              </span>
            </div>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex gap-8 items-center mr-2">
            <Link 
              href={"#features"} 
              className="flex items-center gap-1.5 hover:text-[hsl(var(--uganda-gold))] transition-colors"
            >
              <Zap className="w-4 h-4 text-[hsl(var(--uganda-gold))]" />
              <span>Features</span>
            </Link>
            
            <Link 
              href={"/map"} 
              className="flex items-center gap-1.5 hover:text-[hsl(var(--uganda-gold))] transition-colors"
            >
              <Map className="w-4 h-4 text-[hsl(var(--uganda-gold))]" />
              <span>Map</span>
            </Link>
            
            <Link 
              href={"#about"} 
              className="flex items-center gap-1.5 hover:text-[hsl(var(--uganda-gold))] transition-colors"
            >
              <Info className="w-4 h-4 text-[hsl(var(--uganda-gold))]" />
              <span>About</span>
            </Link>
          </div>
          
          {!hasEnvVars ? (
            <Link 
              href={"/sign-up"} 
              className="py-2 px-6 rounded-full font-medium bg-[hsl(var(--uganda-gold))] text-white hover:bg-opacity-90 transition-all"
            >
              Get Started
            </Link>
          ) : (
            <HeaderAuth />
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-foreground p-1 rounded-md focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-lg shadow-xl transform transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex flex-col p-6 space-y-6">
          <Link 
            href={"#features"} 
            className="flex items-center gap-2 py-2 border-b border-foreground/10"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Zap className="w-5 h-5 text-[hsl(var(--uganda-gold))]" />
            Features
          </Link>
          <Link 
            href={"/map"} 
            className="flex items-center gap-2 py-2 border-b border-foreground/10"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Map className="w-5 h-5 text-[hsl(var(--uganda-gold))]" />
            Map
          </Link>
          <Link 
            href={"#about"} 
            className="flex items-center gap-2 py-2 border-b border-foreground/10"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Info className="w-5 h-5 text-[hsl(var(--uganda-gold))]" />
            About
          </Link>
          
          {!hasEnvVars && (
            <Link 
              href={"/sign-up"} 
              className="py-3 px-6 rounded-full font-medium text-center bg-[hsl(var(--uganda-gold))] text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
import Link from "next/link";
import { Menu, X, Map, Info, Zap, Lock } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full fixed top-0 z-50 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center py-3 px-4">
        {/* Logo */}
        <Link href={"/"} className="flex items-center">
          <div className="flex items-baseline">
            <span className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-[hsl(var(--uganda-gold))] to-amber-500 bg-clip-text text-transparent">Uganda</span>
            <span className="font-semibold text-gray-800 dark:text-white text-base sm:text-lg ml-2 relative">
              <span className="hidden sm:inline">Digital</span> Mapping
              <div className="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-[hsl(var(--uganda-gold))] to-transparent"></div>
            </span>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          <div className="flex items-center">
            <Link 
              href={"#features"} 
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[hsl(var(--uganda-gold))] transition-all flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-[hsl(var(--uganda-gold))]" />
              <span>Features</span>
            </Link>
            
            <Link 
              href={"/map"} 
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[hsl(var(--uganda-gold))] transition-all flex items-center gap-1.5"
            >
              <Map className="w-4 h-4 text-[hsl(var(--uganda-gold))]" />
              <span>Map</span>
            </Link>
            
            <Link 
              href={"#about"} 
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[hsl(var(--uganda-gold))] transition-all flex items-center gap-1.5"
            >
              <Info className="w-4 h-4 text-[hsl(var(--uganda-gold))]" />
              <span>About</span>
            </Link>
            
            <Link 
              href={"/admin"} 
              className="ml-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center gap-1.5"
              title="Admin Login"
            >
              <Lock className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
        
        {/* Mobile Menu Button and Admin Link */}
        <div className="flex items-center md:hidden">
          <Link 
            href={"/admin"} 
            className="mr-2 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            title="Admin Login"
            aria-label="Admin Login"
          >
            <Lock className="w-5 h-5" />
          </Link>
          
          <button 
            className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden transform transition-all duration-200 ease-in-out overflow-hidden ${
          mobileMenuOpen ? "max-h-56 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white dark:bg-gray-900 px-4 py-2 shadow-inner">
          <Link 
            href={"#features"} 
            className="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[hsl(var(--uganda-gold))] transition-all flex items-center gap-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Zap className="w-4 h-4 text-[hsl(var(--uganda-gold))]" />
            Features
          </Link>
          
          <Link 
            href={"/map"} 
            className="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[hsl(var(--uganda-gold))] transition-all flex items-center gap-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Map className="w-4 h-4 text-[hsl(var(--uganda-gold))]" />
            Map
          </Link>
          
          <Link 
            href={"#about"} 
            className="block px-3 py-2.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[hsl(var(--uganda-gold))] transition-all flex items-center gap-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Info className="w-4 h-4 text-[hsl(var(--uganda-gold))]" />
            About
          </Link>
        </div>
      </div>
    </nav>
  );
}
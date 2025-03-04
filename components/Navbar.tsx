import Link from "next/link";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import HeaderAuth from "@/components/header-auth";

export default function Navbar() {
  return (
    <nav className="w-full flex justify-center h-16 fixed top-0 bg-background/80 backdrop-blur-sm z-50 border-b border-b-foreground/5">
      <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5">
        <div className="flex gap-5 items-center">
          <Link href={"/"} className="font-bold text-lg">
            <span style={{ color: 'hsl(var(--uganda-gold))' }}>Uganda</span> Digital Mapping
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-6 items-center">
            <Link href={"#features"} className="hover:text-opacity-70 transition-all">Features</Link>
            <Link href={"/map"} className="hover:text-opacity-70 transition-all">Map</Link>
            <Link href={"#about"} className="hover:text-opacity-70 transition-all">About</Link>
          </div>
          {!hasEnvVars ? (
            <Link 
              href={"/sign-up"} 
              className="py-2 px-4 rounded-lg font-medium"
              style={{ backgroundColor: 'hsl(var(--uganda-gold))', color: 'white' }}
            >
              Get Started
            </Link>
          ) : (
            <HeaderAuth />
          )}
        </div>
      </div>
    </nav>
  );
}
import HeaderAuth from "@/components/header-auth";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Uganda Digital Infrastructure Mapping",
  description: "Mapping Uganda's Digital Future: A comprehensive infrastructure visualization platform",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col items-center">
          <div className="flex-1 w-full flex flex-col items-center">
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
            <div className="w-full pt-16">
              {children}
            </div>

            <footer className="w-full py-12 border-t border-t-foreground/10 bg-foreground/5">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="font-bold text-lg mb-4">
                      <span style={{ color: 'hsl(var(--uganda-gold))' }}>Uganda</span> Digital Infrastructure Mapping
                    </h3>
                    <p className="text-sm text-foreground/70 max-w-md">
                      A comprehensive platform for visualizing and analyzing Uganda's digital infrastructure for strategic planning and development.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Resources</h4>
                    <ul className="space-y-2 text-sm text-foreground/70">
                      <li><Link href={"#"} className="hover:text-foreground transition-colors">Documentation</Link></li>
                      <li><Link href={"#"} className="hover:text-foreground transition-colors">API Reference</Link></li>
                      <li><Link href={"#"} className="hover:text-foreground transition-colors">Support Center</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Legal</h4>
                    <ul className="space-y-2 text-sm text-foreground/70">
                      <li><Link href={"#"} className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                      <li><Link href={"#"} className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                      <li><Link href={"#"} className="hover:text-foreground transition-colors">Data Protection</Link></li>
                    </ul>
                  </div>
                </div>
                <div className="w-full h-px bg-foreground/10 my-8"></div>
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <p className="text-xs text-foreground/60">
                    © {new Date().getFullYear()} Uganda Digital Infrastructure Mapping. All rights reserved.
                  </p>
                  <p className="text-xs text-foreground/60 mt-2 md:mt-0">
                    Powered by{" "}
                    <a
                      href="https://supabase.com/"
                      target="_blank"
                      className="hover:underline"
                      rel="noreferrer"
                    >
                      Supabase
                    </a>{" "}
                    and{" "}
                    <a
                      href="https://nextjs.org/"
                      target="_blank"
                      className="hover:underline"
                      rel="noreferrer"
                    >
                      Next.js
                    </a>
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </body>
    </html>
  );
}
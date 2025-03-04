import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <section className="min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-5 min-h-screen">
        {/* Left side - Background image with overlay and features (takes up more space) */}
        <div className="relative flex items-end px-4 pb-10 pt-60 sm:px-6 sm:pb-16 md:justify-center lg:px-8 lg:pb-24 lg:col-span-3">
          <div className="absolute inset-0">
            <img
              className="h-full w-full object-cover object-center"
              src="https://img.freepik.com/free-vector/digital-world-map_1017-8011.jpg" // Replace with a different image of Uganda's digital infrastructure
              alt="Uganda Digital Infrastructure"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          
          {/* Content overlay */}
          <div className="relative">
            <div className="w-full max-w-2xl xl:mx-auto xl:w-full">
              <h3 className="text-4xl font-bold text-white mb-6">
                Join Uganda's Digital Infrastructure Initiative
              </h3>
              <p className="text-xl text-white/80 mb-10 max-w-xl">
                Create your account to access powerful infrastructure mapping tools and contribute to Uganda's digital transformation.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
                  <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" 
                       style={{ backgroundColor: 'hsl(var(--uganda-gold))' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <h4 className="text-white text-lg font-semibold mb-2">Comprehensive Mapping</h4>
                  <p className="text-white/70">Access detailed infrastructure data across all of Uganda's districts.</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
                  <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center" 
                       style={{ backgroundColor: 'hsl(var(--uganda-red))' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20V10"></path>
                      <path d="M18 20V4"></path>
                      <path d="M6 20v-6"></path>
                    </svg>
                  </div>
                  <h4 className="text-white text-lg font-semibold mb-2">Data Analytics</h4>
                  <p className="text-white/70">Leverage powerful analytics tools to make data-driven decisions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Sign up form */}
        <div className="flex items-center justify-center py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24 lg:col-span-2">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="h-14 w-14 rounded-full flex items-center justify-center" 
                   style={{ background: `linear-gradient(45deg, hsl(var(--uganda-gold)), hsl(var(--uganda-red)))` }}>
                <span className="text-white text-xl font-bold">UDM</span>
              </div>
            </div>

            <h2 className="text-center text-2xl font-bold leading-tight mb-2">
              Create your account
            </h2>
            <p className="text-center text-sm text-foreground/70 mb-8">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-semibold hover:underline"
                style={{ color: 'hsl(var(--uganda-gold))' }}
              >
                Sign in
              </Link>
            </p>

            <form action={signUpAction} method="POST">
              <div className="space-y-5">
                <div>
                  <Label
                    htmlFor="email"
                    className="text-base font-medium"
                  >
                    Email address
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="password"
                    className="text-base font-medium"
                  >
                    Password
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Your password"
                      minLength={6}
                      required
                      className="flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                    />
                  </div>
                  <p className="text-xs text-foreground/60 mt-1">
                    Password must be at least 6 characters
                  </p>
                </div>

                <div>
                  <SubmitButton 
                    pendingText="Signing up..." 
                    className="flex w-full items-center justify-center rounded-md px-3.5 py-2.5 font-semibold text-white transition-all duration-200 focus:outline-none"
                    style={{ 
                      background: `linear-gradient(to right, hsl(var(--uganda-gold)), hsl(var(--uganda-red)))` 
                    }}
                  >
                    Create Account <ArrowRight className="ml-2" size={16} />
                  </SubmitButton>
                  
                  <FormMessage message={searchParams} />
                </div>
              </div>
            </form>

            <div className="mt-6 mb-4">
              <SmtpMessage />
            </div>
            
            <div className="mt-4">
              <p className="text-xs text-center text-foreground/60">
                By creating an account, you agree to our{" "}
                <a href="#" className="underline hover:text-foreground/80">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="underline hover:text-foreground/80">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
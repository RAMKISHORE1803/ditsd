import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  
  return (
    <section className="min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left side - Background image with overlay and features */}
        <div className="relative flex items-end px-4 pb-10 pt-60 sm:px-6 sm:pb-16 md:justify-center lg:px-8 lg:pb-24">
          <div className="absolute inset-0">
            <img
              className="h-full w-full object-cover object-center"
              src="https://images.stockcake.com/public/e/6/c/e6cd3462-f39f-4089-9195-fc582d4f6f0f_large/global-network-map-stockcake.jpg" // Replace with an image related to Uganda's digital infrastructure
              alt="Uganda Digital Infrastructure Map"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          
          {/* Content overlay */}
          <div className="relative">
            <div className="w-full max-w-xl xl:mx-auto xl:w-full xl:max-w-xl">
              <h3 className="text-4xl font-bold text-white">
                Transforming Uganda's Digital Future
              </h3>
              <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <li className="flex items-center space-x-3">
                  <div className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: 'hsl(var(--uganda-gold))' }}>
                    <svg
                      className="h-3.5 w-3.5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <span className="text-lg font-medium text-white">
                    Interactive Mapping
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: 'hsl(var(--uganda-red))' }}>
                    <svg
                      className="h-3.5 w-3.5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <span className="text-lg font-medium text-white">
                    Real-time Analytics
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: 'hsl(var(--uganda-green))' }}>
                    <svg
                      className="h-3.5 w-3.5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <span className="text-lg font-medium text-white">
                    Data-driven Planning
                  </span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: 'hsl(var(--uganda-gold))' }}>
                    <svg
                      className="h-3.5 w-3.5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <span className="text-lg font-medium text-white">
                    Secure Access Controls
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex items-center justify-center py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <div className="xl:mx-auto xl:w-full xl:max-w-sm 2xl:max-w-md">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="h-14 w-14 rounded-full flex items-center justify-center" 
                   style={{ background: `linear-gradient(45deg, hsl(var(--uganda-gold)), hsl(var(--uganda-red)))` }}>
                <span className="text-white text-xl font-bold">UDM</span>
              </div>
            </div>

            <h2 className="text-center text-2xl font-bold leading-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-foreground/70">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-semibold hover:underline"
                style={{ color: 'hsl(var(--uganda-gold))' }}
              >
                Create a free account
              </Link>
            </p>

            <form action={signInAction} method="POST" className="mt-8">
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
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-base font-medium"
                    >
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-semibold hover:underline"
                      style={{ color: 'hsl(var(--uganda-gold))' }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="mt-2">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Your password"
                      required
                      className="flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                    />
                  </div>
                </div>

                <div>
                  <SubmitButton 
                    pendingText="Signing In..." 
                    className="flex w-full items-center justify-center rounded-md px-3.5 py-2.5 font-semibold text-white transition-all duration-200 focus:outline-none"
                    style={{ 
                      background: `linear-gradient(to right, hsl(var(--uganda-gold)), hsl(var(--uganda-red)))` 
                    }}
                  >
                    Sign in <ArrowRight className="ml-2" size={16} />
                  </SubmitButton>
                  
                  <FormMessage message={searchParams} />
                </div>
              </div>
            </form>

            <div className="my-6">
              <div className="flex items-center justify-center space-x-2">
                <div className="h-px w-14 bg-foreground/20" />
                <span className="text-sm text-foreground/60">
                  or continue with
                </span>
                <div className="h-px w-14 bg-foreground/20" />
              </div>
            </div>

            <div>
              <button
                type="button"
                className="relative inline-flex w-full items-center justify-center rounded-md border bg-background px-3.5 py-2.5 font-semibold text-foreground transition-all duration-200 hover:bg-muted focus:outline-none"
              >
                <span className="mr-2 inline-block">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 256 262"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid"
                  >
                    <path
                      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                      fill="#4285F4"
                    />
                    <path
                      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                      fill="#34A853"
                    />
                    <path
                      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                      fill="#FBBC05"
                    />
                    <path
                      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                      fill="#EB4335"
                    />
                  </svg>
                </span>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Grid background with mask */}
      <div className="absolute inset-0 -z-10 h-[150vh] bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Uganda-themed gradient background */}
      <div 
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 50%, hsla(var(--uganda-gold), 0.3) 0%, hsla(var(--uganda-red), 0.2) 40%, transparent 70%)',
          transform: `translate(${(mousePosition.x - 0.5) * 20}px, ${(mousePosition.y - 0.5) * 20}px)`,
          transition: 'transform 0.2s ease-out'
        }}
      />

      <div className="flex h-full flex-col items-center justify-center pt-20 pb-24">
        {/* Announcement tag */}
        <motion.button 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="group relative grid overflow-hidden rounded-full border px-4 py-1 transition-colors duration-200 bg-[hsla(var(--uganda-gold),0.1)]"
        >
          <span className="z-10 flex items-center justify-center gap-1.5 py-0.5 text-sm">
            ✨ Mapping Uganda's Future
            <ChevronRight className="size-4" />
          </span>
        </motion.button>

        {/* Main headline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 flex w-11/12 max-w-3xl flex-col items-center md:w-full"
        >
          <h1 className="lg:text-7xl bg-gradient-to-b from-[hsl(var(--uganda-gold))] to-[hsl(var(--uganda-red))] bg-clip-text text-center text-4xl font-bold text-transparent md:text-6xl md:!leading-tight">
            Digital Infrastructure Mapping for Uganda
          </h1>
          <p className="mt-6 text-center text-base text-foreground/80 md:text-lg">
            A comprehensive platform for visualizing, analyzing, and developing Uganda's digital infrastructure. 
            Make data-driven decisions with our advanced mapping technology.
          </p>
          <div className="relative mt-8 flex w-full items-center justify-center md:mt-12">
            <Link
              href="/map"
              className="shadow-3xl flex w-max cursor-pointer select-none items-center justify-center gap-2 rounded-full border-t border-foreground/30 bg-background/10 px-2 py-1 shadow-background/40 backdrop-blur-lg md:gap-8 md:py-2"
            >
              <p className="px-4 text-center text-sm font-medium text-foreground md:text-base lg:pr-0">
                ✨ {"  "} Start exploring infrastructure data today!
              </p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative m-1 inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full border-x-2 border-b-2 border-[hsl(var(--uganda-gold))] bg-gradient-to-tr from-[hsl(var(--uganda-gold))] to-[hsl(var(--uganda-red))] px-4 py-1 text-white shadow-lg transition duration-100 ease-in-out active:translate-y-0.5 active:shadow-none"
              >
                <span className="absolute size-0 rounded-full bg-white opacity-10 transition-all duration-300 ease-out group-hover:size-36"></span>
                <span className="relative flex items-center font-medium">
                  {" "}
                  Get Started
                  <ArrowRight className="ml-1 size-4" />
                </span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Map visualization showcase */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="relative flex w-full items-center px-4 py-10 md:py-16"
        >
          <div
            style={{
              background:
                "conic-gradient(from 230.29deg at 51.63% 52.16%, hsl(var(--uganda-gold)) 0deg, hsl(var(--uganda-red)) 120deg, hsl(var(--uganda-green)) 240deg, hsl(var(--uganda-gold)) 360deg)",
            }}
            className="absolute inset-0 left-1/2 top-1/2 -z-10 size-2/4 -translate-x-1/2 -translate-y-1/2 opacity-20 blur-[10rem]"
          />
          <div className="-m-2 rounded-xl p-2 ring-1 ring-inset ring-foreground/20 backdrop-blur-3xl lg:-m-4 lg:rounded-2xl">
            <div className="absolute inset-0 left-1/2 top-1/2 -z-10 size-3/4 -translate-x-1/2 -translate-y-1/2 blur-[10rem]" />
            <div className="relative overflow-hidden rounded-md bg-foreground/5 shadow-2xl ring-1 ring-border lg:rounded-xl">
              <Image
                src={"https://www.bmz-digital.global/wp-content/uploads/resized/2023/01/ITU_interactive-terrestrial-transmission-map-1920x0-c-default.png"} // Create this image showing a map visualization
                alt="Uganda infrastructure mapping visualization"
                width={1200}
                height={600}
                quality={100}
                className="z-50"
              />
              
              {/* Floating data points */}
              <div className="absolute top-[30%] left-[40%] bg-white/90 p-2 rounded-md shadow-md text-xs">
                <div className="font-medium">Kampala Region</div>
                <div className="text-[10px] text-foreground/70">Network Coverage: 89%</div>
              </div>
              
              <div className="absolute top-[60%] left-[25%] bg-white/90 p-2 rounded-md shadow-md text-xs">
                <div className="font-medium">Western Region</div>
                <div className="text-[10px] text-foreground/70">Internet Access: 74%</div>
              </div>
              
              <BorderBeam 
                size={350} 
                duration={12} 
                delay={0}
                colorFrom="hsl(var(--uganda-gold))"
                colorTo="hsl(var(--uganda-red))"
              />
            </div>
          </div>
        </motion.div>
        
        {/* Stats row */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-10"
        >
          {[
            { value: "95%", label: "Coverage Mapped", color: "var(--uganda-gold)" },
            { value: "16K+", label: "Infrastructure Points", color: "var(--uganda-red)" },
            { value: "112", label: "Districts Analyzed", color: "var(--uganda-green)" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span 
                className="text-4xl font-bold mb-1" 
                style={{ color: `hsl(${stat.color})` }}
              >
                {stat.value}
              </span>
              <span className="text-sm text-foreground/70">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

const BorderBeam = ({
  className,
  size = 200,
  duration = 15,
  anchor = 90,
  borderWidth = 2,
  colorFrom = "#0000ff",
  colorTo = "#7800ff",
  delay = 0,
}: BorderBeamProps) => {
  return (
    <div
      style={
        {
          "--size": size,
          "--duration": duration,
          "--anchor": anchor,
          "--border-width": borderWidth,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--delay": `-${delay}s`,
        } as React.CSSProperties
      }
      className={cn(
        "absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]",

        // mask styles
        "![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]",

        // pseudo styles
        "after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[animation-delay:var(--delay)] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:calc(var(--anchor)*1%)_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",
        className,
      )}
    />
  );
};

export default Hero;
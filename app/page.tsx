"use client";

import { useEffect, useState, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/hero";
import State from "@/components/States";
import Testimonial from "@/components/Testimonials";

export default function Home() {
  // For mouse-following effect in hero
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax effect for hero section
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  // Track mouse position for hero interactive elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Feature cards staggered animation
  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  // Features data with icons
  const features = [
    {
      icon: "/images/mobile-icon.svg",
      iconFallback: "📱",
      title: "Mobile Coverage",
      description:
        "Real-time visualization of mobile network coverage across Uganda's regions.",
      color: "var(--uganda-gold)",
    },
    {
      icon: "/images/power-icon.svg",
      iconFallback: "🔌",
      title: "Power Grid",
      description:
        "Comprehensive mapping of electricity infrastructure and power distribution networks.",
      color: "var(--uganda-red)",
    },
    {
      icon: "/images/internet-icon.svg",
      iconFallback: "🌐",
      title: "Internet Access",
      description:
        "Detailed insights into internet penetration and broadband availability by district.",
      color: "var(--uganda-green)",
    },
    {
      icon: "/images/tower-icon.svg",
      iconFallback: "📡",
      title: "Cell Towers",
      description:
        "Geographic distribution of telecommunication towers with coverage analysis.",
      color: "var(--uganda-gold)",
    },
    {
      icon: "/images/route-icon.svg",
      iconFallback: "🚄",
      title: "Transport Routes",
      description:
        "Transportation infrastructure mapping integrated with digital connectivity data.",
      color: "var(--uganda-red)",
    },
    {
      icon: "/images/analytics-icon.svg",
      iconFallback: "📊",
      title: "Data Analytics",
      description:
        "Advanced analytics dashboards for infrastructure planning and optimization.",
      color: "var(--uganda-green)",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center relative overflow-hidden">
      {/* Hero Section */}

      <Hero />

      <State />
      {/* Features Section */}
      <section
        id="features"
        className="w-full py-20 px-4 bg-background relative"
      >
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle,_hsl(var(--foreground))_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <motion.p
              className="text-base uppercase tracking-wider mb-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{ color: "hsl(var(--uganda-gold))" }}
            >
              COMPREHENSIVE SYSTEM
            </motion.p>
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Infrastructure{" "}
              <span style={{ color: "hsl(var(--uganda-gold))" }}>Mapping</span>
            </motion.h2>
            <motion.div
              className="w-24 h-1 rounded-full mx-auto mb-8"
              style={{
                background: `linear-gradient(45deg, hsl(var(--uganda-gold)), hsl(var(--uganda-red)), hsl(var(--uganda-green)))`,
              }}
              initial={{ width: 0 }}
              whileInView={{ width: 96 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />
            <motion.p
              className="max-w-2xl mx-auto text-foreground/70"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Visualize Uganda's entire digital infrastructure ecosystem with
              our advanced mapping system
            </motion.p>
          </div>

          {/* Feature cards with premium design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={cardVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300"
                style={{ boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)" }}
              >
                {/* Card background with subtle gradient */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, hsl(${feature.color}), white)`,
                  }}
                ></div>

                {/* Border top accent */}
                <div
                  className="absolute top-0 left-0 w-full h-1"
                  style={{
                    background: `linear-gradient(to right, hsl(${feature.color}), hsl(${feature.color}) 50%, transparent)`,
                  }}
                ></div>

                {/* Card content */}
                <div className="p-8">
                  <div className="flex flex-col items-start">
                    <div
                      className="rounded-lg p-3 mb-6 relative"
                      style={{
                        background: `linear-gradient(135deg, hsl(${feature.color}), hsl(${feature.color})/30%)`,
                      }}
                    >
                      <span className="text-2xl text-white">
                        {feature.iconFallback}
                      </span>
                      <div
                        className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full opacity-20"
                        style={{ background: `hsl(${feature.color})` }}
                      ></div>
                    </div>

                    <h3 className="text-xl font-semibold mb-3 group-hover:text-[hsl(var(--uganda-gold))] transition-colors duration-300">
                      {feature.title}
                    </h3>

                    <p className="text-foreground/70 group-hover:text-foreground transition-colors duration-300">
                      {feature.description}
                    </p>

                    <motion.span
                      className="mt-6 inline-flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300"
                      style={{ color: `hsl(${feature.color})` }}
                      initial={{ x: -10 }}
                      whileInView={{ x: 0 }}
                    >
                      Learn more
                      <svg
                        className="ml-1 w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </motion.span>
                  </div>
                </div>

                {/* Bottom right decorative element */}
                <div
                  className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full opacity-10 transition-all duration-300 group-hover:opacity-20"
                  style={{ background: `hsl(${feature.color})` }}
                ></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Preview Section */}
      <section
        id="map"
        className="w-full py-28 px-4 bg-muted/20 relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent"></div>
        <div className="absolute inset-0">
          <svg
            className="absolute top-10 left-10 opacity-20"
            width="200"
            height="200"
            fill="none"
          >
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="hsl(var(--uganda-gold))"
              strokeWidth="2"
              strokeDasharray="10 5"
            />
          </svg>
          <svg
            className="absolute bottom-10 right-10 opacity-20"
            width="300"
            height="300"
            fill="none"
          >
            <circle
              cx="150"
              cy="150"
              r="120"
              stroke="hsl(var(--uganda-red))"
              strokeWidth="2"
              strokeDasharray="20 10"
            />
          </svg>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Interactive Map Visualization */}
            <motion.div
              className="w-full lg:w-3/5 relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-foreground/5 shadow-2xl">
                {/* Map base with stylized visualization */}
                <div className="absolute inset-0 bg-white">
                  {/* The map base - could be a real image in production */}
                  <div className="absolute inset-0 bg-[#f8f8f8]">
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.05),rgba(0,0,0,0.05)_1px,transparent_1px,transparent_40px),repeating-linear-gradient(90deg,rgba(0,0,0,0.05),rgba(0,0,0,0.05)_1px,transparent_1px,transparent_40px)]"></div>

                    {/* Uganda outline (simplified) */}
                    <svg
                      className="absolute inset-0"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M40,20 C45,18 50,15 55,20 C60,25 65,30 70,32 C75,34 80,40 75,45 C70,50 65,60 60,65 C55,70 50,75 45,70 C40,65 35,60 30,55 C25,50 20,45 25,40 C30,35 35,22 40,20 Z"
                        fill="none"
                        stroke="hsl(var(--uganda-gold))"
                        strokeWidth="0.5"
                        opacity="0.8"
                      />
                    </svg>
                  </div>

                  {/* Interactive hover areas */}
                  <motion.div
                    className="absolute top-[30%] left-[40%] w-[15%] h-[15%] rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(252,181,20,0.4) 0%, rgba(252,181,20,0) 70%)",
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.6, 0.8, 0.6],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  <motion.div
                    className="absolute top-[50%] left-[60%] w-[12%] h-[12%] rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(212,28,48,0.4) 0%, rgba(212,28,48,0) 70%)",
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0.7, 0.5],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                  />

                  <motion.div
                    className="absolute top-[20%] left-[50%] w-[10%] h-[10%] rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(78,157,45,0.4) 0%, rgba(78,157,45,0) 70%)",
                    }}
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.4, 0.6, 0.4],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 2,
                    }}
                  />

                  {/* Data points */}
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        top: `${15 + Math.random() * 70}%`,
                        left: `${15 + Math.random() * 70}%`,
                        backgroundColor: `hsl(var(--uganda-${["gold", "red", "green"][i % 3]}))`,
                        boxShadow: `0 0 8px hsl(var(--uganda-${["gold", "red", "green"][i % 3]}))`,
                      }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}

                  {/* Connection lines */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute h-px"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 30}%`,
                        width: `${20 + Math.random() * 40}%`,
                        backgroundColor: `hsl(var(--uganda-${["gold", "red", "green"][i % 3]}))`,
                        opacity: 0.5,
                        transformOrigin: "left",
                      }}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
                    />
                  ))}

                  {/* Data visualization overlay */}
                  <div className="absolute bottom-4 right-4 bg-white/90 p-4 rounded-lg backdrop-blur-sm border border-foreground/5 shadow-lg">
                    <div className="text-xs font-medium mb-2">
                      Infrastructure Coverage
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2 w-32 rounded-full overflow-hidden bg-foreground/10">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(to right, hsl(var(--uganda-gold)), hsl(var(--uganda-red)))`,
                            width: "76%",
                          }}
                          initial={{ width: 0 }}
                          whileInView={{ width: "76%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 1 }}
                        />
                      </div>
                      <span className="text-xs font-semibold">76%</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-foreground/60">
                      <span>Rural: 68%</span>
                      <span>Urban: 94%</span>
                    </div>
                  </div>

                  {/* Floating data cards */}
                  <motion.div
                    className="absolute top-[25%] left-[35%] bg-white shadow-lg rounded-lg p-2 text-xs border border-foreground/5"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.2 }}
                  >
                    <div className="font-medium">Kampala Region</div>
                    <div className="text-[10px] text-foreground/70">
                      4G Coverage: 98%
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute top-[55%] left-[65%] bg-white shadow-lg rounded-lg p-2 text-xs border border-foreground/5"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.5 }}
                  >
                    <div className="font-medium">Eastern Region</div>
                    <div className="text-[10px] text-foreground/70">
                      Fiber: 62%
                    </div>
                  </motion.div>
                </div>

                {/* Interactive overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>
              </div>

              {/* Map controls */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <motion.button
                  className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </motion.button>
                <motion.button
                  className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="M21 21l-4.35-4.35"></path>
                  </svg>
                </motion.button>
                <motion.button
                  className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 5v14M5 12h14"></path>
                  </svg>
                </motion.button>
              </div>
            </motion.div>

            {/* Map info content with enhanced design */}
            <motion.div
              className="w-full lg:w-2/5"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div
                className="text-sm font-medium tracking-wider mb-2"
                style={{ color: "hsl(var(--uganda-gold))" }}
              >
                INTERACTIVE SYSTEM
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Infrastructure{" "}
                <span style={{ color: `hsl(var(--uganda-gold))` }}>
                  Visualization
                </span>
              </h2>
              <div
                className="w-24 h-1 rounded-full mb-8"
                style={{
                  background: `linear-gradient(45deg, hsl(var(--uganda-gold)), hsl(var(--uganda-red)), hsl(var(--uganda-green)))`,
                }}
              ></div>

              <div className="space-y-8">
                <p className="text-foreground/80 leading-relaxed">
                  Explore Uganda's digital infrastructure through our intuitive,
                  data-rich mapping system. Identify coverage gaps, plan
                  expansions, and optimize resource allocation with our
                  award-winning visualization platform.
                </p>

                <div className="space-y-6">
                  {[
                    {
                      title: "Real-time Updates",
                      description:
                        "Continuously updated infrastructure data reflecting the latest developments",
                      icon: "refresh-cw",
                    },
                    {
                      title: "Multi-layer Analysis",
                      description:
                        "Overlay different infrastructure types for comprehensive planning",
                      icon: "layers",
                    },
                    {
                      title: "Predictive Modeling",
                      description:
                        "AI-powered insights for future infrastructure needs",
                      icon: "trending-up",
                    },
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-4 group"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.2 }}
                      whileHover={{ x: 5 }}
                    >
                      <div
                        className="mt-1 flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `hsl(var(--uganda-${["gold", "red", "green"][i % 3]}) / 10%)`,
                        }}
                      >
                        <div
                          style={{
                            color: `hsl(var(--uganda-${["gold", "red", "green"][i % 3]}))`,
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            {feature.icon === "refresh-cw" && (
                              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            )}
                            {feature.icon === "layers" && (
                              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                            )}
                            {feature.icon === "trending-up" && (
                              <path d="M23 6l-9.5 9.5-5-5L1 18M23 6h-6M23 6v6"></path>
                            )}
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg group-hover:text-[hsl(var(--uganda-gold))] transition-colors duration-300">
                          {feature.title}
                        </h4>
                        <p className="text-foreground/70 text-sm mt-1 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  className="relative overflow-hidden group mt-10"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[hsl(var(--uganda-gold))] to-[hsl(var(--uganda-red))] transition-all duration-300 group-hover:scale-105"></span>
                  <span className="relative block py-4 px-8 rounded-lg font-semibold text-white transition-all duration-300">
                    Request Demo Access
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-white/20"></span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Testimonial />

      {/* Call to Action Section */}
      <section
        id="about"
        className="w-full py-24 px-4 relative bg-background overflow-hidden"
      >
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom right, hsl(var(--uganda-gold) / 5%), hsl(var(--uganda-green) / 5%))`,
            }}
          ></div>

          <svg
            className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] opacity-10"
            viewBox="0 0 200 200"
          >
            <path
              fill="hsl(var(--uganda-gold))"
              d="M47.5,-57.2C62.8,-47.7,77.5,-33.4,80.9,-16.8C84.4,-0.2,76.6,18.8,64.8,32.2C53,45.7,37.1,53.7,20.1,62.5C3.1,71.4,-15,81.1,-28.3,76.2C-41.5,71.3,-50,51.7,-58.4,33.5C-66.9,15.3,-75.3,-1.6,-72,-16.5C-68.6,-31.4,-53.5,-44.3,-38.6,-53.8C-23.8,-63.3,-11.9,-69.4,2.4,-72.4C16.7,-75.4,33.3,-75.1,47.5,-57.2Z"
              transform="translate(100 100)"
            />
          </svg>

          <svg
            className="absolute -top-[5%] -left-[5%] w-[40%] h-[40%] opacity-10"
            viewBox="0 0 200 200"
          >
            <path
              fill="hsl(var(--uganda-red))"
              d="M37,-48.8C51.2,-40.9,68,-33.8,73.5,-21.2C78.9,-8.6,73,9.4,64.4,23.8C55.8,38.2,44.3,49.1,30.7,56.1C17.1,63.1,1.3,66.2,-13.8,63.5C-28.9,60.8,-43.3,52.2,-55,39.9C-66.7,27.5,-75.8,11.3,-74.9,-4.5C-74,-20.3,-63.2,-35.8,-49.4,-44.5C-35.5,-53.3,-18.8,-55.5,-3.5,-51.3C11.8,-47.2,23.7,-36.8,37,-48.8Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Transform Uganda's <br /> Digital Infrastructure?
              </h2>
              <div
                className="w-24 h-1 rounded-full mx-auto mb-8"
                style={{
                  background: `linear-gradient(45deg, hsl(var(--uganda-gold)), hsl(var(--uganda-red)), hsl(var(--uganda-green)))`,
                }}
              ></div>
              <p className="text-lg mb-10 text-foreground/80 max-w-2xl mx-auto">
                Join us in building a more connected Uganda through advanced
                infrastructure mapping and planning tools.
              </p>
            </div>

            {/* CTA Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                className="bg-white rounded-2xl overflow-hidden shadow-xl relative group"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                {/* Card gradient border */}
                <div className="absolute inset-0 p-0.5">
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(45deg, hsl(var(--uganda-gold)), hsl(var(--uganda-red)))",
                      opacity: 0.3,
                    }}
                  ></div>
                </div>

                <div className="relative p-8">
                  <div className="flex flex-col h-full">
                    <div
                      className="mb-6 p-3 rounded-lg inline-flex"
                      style={{
                        background:
                          "linear-gradient(45deg, hsl(var(--uganda-gold) / 20%), hsl(var(--uganda-red) / 10%))",
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="hsl(var(--uganda-gold))"
                        strokeWidth="2"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>

                    <h3 className="text-xl font-semibold mb-2">
                      Government Partners
                    </h3>
                    <p className="text-foreground/70 mb-6 flex-grow">
                      Collaborate with us to enhance infrastructure planning and
                      optimize resource allocation for digital initiatives.
                    </p>

                    <motion.button
                      className="relative overflow-hidden py-3 px-6 rounded-lg font-medium text-foreground border-2 border-[hsl(var(--uganda-gold))] transition-all duration-300 text-sm group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                        Join Partnership
                      </span>
                      <span className="absolute inset-0 w-full h-full bg-[hsl(var(--uganda-gold))] -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-white rounded-2xl overflow-hidden shadow-xl relative group"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                {/* Card gradient border */}
                <div className="absolute inset-0 p-0.5">
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background:
                        "linear-gradient(45deg, hsl(var(--uganda-green)), hsl(var(--uganda-gold)))",
                      opacity: 0.3,
                    }}
                  ></div>
                </div>

                <div className="relative p-8">
                  <div className="flex flex-col h-full">
                    <div
                      className="mb-6 p-3 rounded-lg inline-flex"
                      style={{
                        background:
                          "linear-gradient(45deg, hsl(var(--uganda-green) / 20%), hsl(var(--uganda-gold) / 10%))",
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="hsl(var(--uganda-green))"
                        strokeWidth="2"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                      </svg>
                    </div>

                    <h3 className="text-xl font-semibold mb-2">
                      Telecom Providers
                    </h3>
                    <p className="text-foreground/70 mb-6 flex-grow">
                      Leverage our mapping platform to identify coverage gaps
                      and optimize network expansion strategies.
                    </p>

                    <motion.button
                      className="relative overflow-hidden group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[hsl(var(--uganda-green))] to-[hsl(var(--uganda-gold))] transition-all duration-300 group-hover:scale-105"></span>
                      <span className="relative block py-3 px-6 rounded-lg font-medium text-white transition-all duration-300 text-sm">
                        Request Demo
                      </span>
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-white/20"></span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

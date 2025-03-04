import React from "react";
import { cn } from "@/lib/utils";

const Testimonial = () => {
  return (
    <div className="py-16">
      <div className="mx-auto mb-16 max-w-4xl text-center">
        <h1 className="mb-6 text-3xl font-bold md:text-5xl ">
          Transforming Connectivity in Uganda with
          <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            Digital Infrastructure Mapping
          </span>
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300 md:text-xl">
          Experts and organizations share their experiences using our mapping
          platform to bridge connectivity gaps, enhance planning, and drive
          socio-economic growth in Uganda.
        </p>
      </div>

      <div className="relative flex h-[700px] w-full flex-row items-center justify-center overflow-hidden rounded-lg">
        <Marquee pauseOnHover vertical className="[--duration:20s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.name} {...review} />
          ))}
        </Marquee>
        <Marquee
          reverse
          pauseOnHover
          vertical
          className="hidden [--duration:20s] sm:block"
        >
          {secondRow.map((review) => (
            <div key={review.name} className="mb-4">
              <ReviewCard {...review} />
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
};
export default Testimonial;

const ReviewCard = ({ img, name, title, organization, description }) => {
  return (
    <figure className="relative size-full space-y-6 overflow-hidden rounded-xl border p-4 shadow-sm">
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="48" height="48" alt={name} src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white md:text-base">
            {name}
          </figcaption>
          <p className="truncate text-xs font-medium dark:text-white/40 md:text-sm">
            {title}, {organization}
          </p>
        </div>
      </div>
      <blockquote className="text-sm md:text-lg">{description}</blockquote>
    </figure>
  );
};

const testimonials = [
  {
    name: "Dr. Samuel Kato",
    title: "GIS Analyst",
    organization: "Uganda Ministry of ICT",
    description:
      "The digital infrastructure mapping project has been crucial in identifying connectivity gaps and optimizing broadband deployment in rural areas.",
    img: "https://img.freepik.com/free-photo/african-man-using-tablet_23-2148876034.jpg",
  },
  {
    name: "Grace Namugwanya",
    title: "Telecom Engineer",
    organization: "Uganda Communications Commission",
    description:
      "With this platform, we can now make data-driven decisions for network expansion, ensuring that no community is left behind.",
    img: "https://img.freepik.com/free-photo/young-woman-working-desk_23-2149021174.jpg",
  },
  {
    name: "Michael Ochieng",
    title: "Urban Planner",
    organization: "Kampala City Authority",
    description:
      "The insights from this project have significantly improved our planning for smart city infrastructure, integrating digital connectivity into urban development.",
    img: "https://img.freepik.com/free-photo/confident-businessman-suit_23-2148876279.jpg",
  },
];

const firstRow = testimonials;
const secondRow = testimonials;

function Marquee({ className, reverse, pauseOnHover = false, children }) {
  return (
    <div
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        "flex-col",
        className
      )}
    >
      <div
        className={cn(
          "flex shrink-0 justify-around flex-col [gap:var(--gap)] animate-marquee-vertical",
          {
            "group-hover:[animation-play-state:paused]": pauseOnHover,
            "[animation-direction:reverse]": reverse,
          }
        )}
      >
        {children}
      </div>
    </div>
  );
}

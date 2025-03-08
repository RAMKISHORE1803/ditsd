import React from "react";
import { cn } from "@/lib/utils";

// Type for a testimonial item
interface Testimonial {
  name: string;
  title: string;
  organization: string;
  description: string;
  img: string;
}

// Type for the ReviewCard component props
interface ReviewCardProps extends Testimonial {}

const ReviewCard: React.FC<ReviewCardProps> = ({ img, name, title, organization, description }) => {
  return (
    <figure className="h-full flex flex-col rounded-xl border p-6 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800">
      <div className="flex flex-row items-center gap-4 mb-4">
        <img
          className="rounded-full object-cover"
          width="64"
          height="64"
          alt={name}
          src={img}
        />
        <div className="flex flex-col">
          <figcaption className="text-base font-semibold dark:text-white md:text-lg">
            {name}
          </figcaption>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {title}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {organization}
          </p>
        </div>
      </div>
      <blockquote className="text-gray-700 dark:text-gray-200 text-base mt-auto">
        "{description}"
      </blockquote>
    </figure>
  );
};

const Testimonial: React.FC = () => {
  return (
    <div className="py-16 px-4 max-w-7xl mx-auto">
      <div className="mx-auto mb-16 max-w-4xl text-center">
        <h1 className="mb-6 text-3xl font-bold md:text-5xl">
          Transforming Connectivity in Uganda with{" "}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((review) => (
          <ReviewCard key={review.name} {...review} />
        ))}
      </div>
    </div>
  );
};

export default Testimonial;

// Expanded testimonials with more entries to fill the grid
const testimonials: Testimonial[] = [
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
  {
    name: "Sarah Nabukenya",
    title: "Project Manager",
    organization: "Rural Connectivity Initiative",
    description:
      "Our team has leveraged this mapping tool to bring internet to over 50 previously disconnected villages in Eastern Uganda within just six months.",
    img: "https://img.freepik.com/free-photo/businesswoman-working-laptop_23-2148121554.jpg",
  },
  {
    name: "David Mugisha",
    title: "Director",
    organization: "Uganda Internet Society",
    description:
      "This platform represents a turning point in our national digital transformation journey. The data visualization capabilities have been invaluable for advocacy.",
    img: "https://img.freepik.com/free-photo/businessman-office_23-2147800752.jpg",
  },
  {
    name: "Esther Nakato",
    title: "Educational Technologist",
    organization: "Digital Schools Initiative",
    description:
      "We've connected over 200 schools to reliable internet using insights from this mapping platform, directly impacting educational outcomes for thousands of students.",
    img: "https://img.freepik.com/free-photo/young-woman-teacher-classroom_23-2148668383.jpg",
  },
];
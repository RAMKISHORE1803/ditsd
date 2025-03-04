import Link from "next/link";

export default function MapExitButton() {
  return (
    <div className="fixed top-4 left-4 z-50">
      <Link 
        href="/" 
        className="flex items-center gap-2 py-2 px-4 bg-background/80 backdrop-blur-sm rounded-lg shadow-md hover:bg-background transition-colors"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M19 12H5"></path>
          <path d="M12 19l-7-7 7-7"></path>
        </svg>
        Exit Map
      </Link>
    </div>
  );
}
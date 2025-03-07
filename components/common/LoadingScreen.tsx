"use client";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export default function LoadingScreen({ 
  message = "Loading...", 
  subMessage = "Please wait while we fetch your data" 
}: LoadingScreenProps) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="text-center bg-white p-8 rounded-xl shadow-xl">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-6 text-gray-800 text-lg font-medium">{message}</p>
        <p className="mt-2 text-gray-600 text-sm">{subMessage}</p>
      </div>
    </div>
  );
}
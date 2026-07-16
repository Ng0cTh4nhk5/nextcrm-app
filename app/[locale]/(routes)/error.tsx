"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Route Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[600px] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6 animate-pulse">
        <AlertCircle className="h-10 w-10" />
      </div>
      
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mb-2">
        Something went wrong!
      </h1>
      
      <p className="text-muted-foreground max-w-md mb-8 text-sm sm:text-base leading-relaxed">
        {error.message || "An unexpected error occurred while loading this page. Please try again or return to the dashboard."}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => reset()}
          variant="default"
          className="flex items-center gap-2 px-5 py-2 font-medium"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
        
        <Button
          variant="outline"
          asChild
          className="flex items-center gap-2 px-5 py-2 font-medium"
        >
          <Link href="/">
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}

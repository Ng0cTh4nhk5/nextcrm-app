"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootLocaleError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Root Locale Error:", error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background font-sans antialiased">
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
            <AlertCircle className="h-10 w-10" />
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mb-2">
            Application Error
          </h1>
          
          <p className="text-muted-foreground max-w-md mb-8 text-sm leading-relaxed">
            A critical error occurred while initializing the application. Please try reloading.
          </p>

          <Button
            onClick={() => reset()}
            variant="default"
            className="flex items-center gap-2 px-5 py-2 font-medium"
          >
            <RotateCcw className="h-4 w-4" />
            Reload Application
          </Button>
        </div>
      </body>
    </html>
  );
}

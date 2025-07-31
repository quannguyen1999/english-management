"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function OAuth2ErrorPage({
  params,
  dict,
}: {
  params: { lang: string };
  dict: any;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("message") || "Authentication failed";

    // Show error message
    toast.error(message);

    // Redirect to login page after a short delay
    // const timer = setTimeout(() => {
    //   router.push("/sign-in");
    // }, 2000);

    // return () => clearTimeout(timer);
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Authentication Failed</h1>
        <p className="text-gray-600 mb-4">
          {searchParams.get("message") ||
            "Something went wrong during authentication."}
        </p>
        <p className="text-sm text-gray-500">Redirecting to login page...</p>
      </div>
    </div>
  );
}

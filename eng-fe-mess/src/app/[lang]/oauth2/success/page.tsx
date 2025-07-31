"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { saveTokens } from "@/utils/auth";

export default function OAuth2SuccessPage({
  params,
  dict,
}: {
  params: { lang: string };
  dict: any;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const tokenType = searchParams.get("tokenType") || "Bearer";
    const expiresIn = searchParams.get("expiresIn");
    const scope = searchParams.get("scope") || "";

    if (token && refreshToken) {
      // Store the tokens using the utility function
      const tokens = {
        access_token: token,
        refresh_token: refreshToken,
        token_type: tokenType,
        expires_in: parseInt(expiresIn || "3600"),
        scope: scope,
      };

      saveTokens(tokens);

      // Show success message
      toast.success("Login successful!");

      // Redirect to dashboard or home page
      router.push("/");
    } else {
      // No token found, redirect to login with error
      toast.error("Authentication failed. Please try again.");
      // router.push("/sign-in");
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg">Processing authentication...</p>
      </div>
    </div>
  );
}

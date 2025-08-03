"use client";

import { saveTokens } from "@/utils/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function OAuth2SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refresh_token");
    const tokenType = searchParams.get("token_type") || "Bearer";
    const expiresIn = searchParams.get("expires_in");
    const scope = searchParams.get("scope") || "";

    if (token && refreshToken) {
      // Store the tokens using the utility function (localStorage)
      const tokens = {
        access_token: token,
        refresh_token: refreshToken,
        token_type: tokenType,
        expires_in: parseInt(expiresIn || "3600"),
        scope: scope,
      };

      saveTokens(tokens);

      // Set cookies by making an API call to set authentication cookies
      const setAuthCookies = async () => {
        try {
          const response = await fetch("/api/auth/set-cookies", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(tokens),
          });

          if (response.ok) {
            // Show success message
            toast.success("Login successful!");

            // Redirect to dashboard or home page
            router.push("/");
          } else {
            throw new Error("Failed to set authentication cookies");
          }
        } catch (error) {
          console.error("Error setting authentication cookies:", error);
          toast.error("Authentication failed. Please try again.");
          router.push("/sign-in");
        }
      };

      setAuthCookies();
    } else {
      // No token found, redirect to login with error
      toast.error("Authentication failed. Please try again.");
      router.push("/sign-in");
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

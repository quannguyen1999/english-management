import { ThemeProvider } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
const font = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Messenger",
  description: "Messenger",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(font.className, "bg-white dark:bg-[#313338]")}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          storageKey="discord-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

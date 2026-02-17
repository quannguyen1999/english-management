"use client";

import { ReactNode } from "react";

interface ChatLayoutProps {
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  error?: ReactNode;
  nav?: ReactNode;
}

export function ChatLayout({
  header,
  children,
  footer,
  error,
  nav,
}: ChatLayoutProps) {
  return (
    <div className="flex h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      {header}
      {children}
      {error}
      {footer}
      {nav}
    </div>
  );
}

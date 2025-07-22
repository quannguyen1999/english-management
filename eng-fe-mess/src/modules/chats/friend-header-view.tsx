"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FriendHeaderView({ dict }: { dict: any }) {
  const router = useRouter();
  return (
    <div className="flex flex-row items-center justify-between">
      <h2 className="text-lg font-semibold">{dict.dashboard.title}</h2>
      <LogOut
        className="size-6 cursor-pointer"
        onClick={() => router.push("/sign-in")}
      />
      <ModeToggle />
    </div>
  );
}

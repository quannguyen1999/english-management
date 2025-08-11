"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { logout } from "@/utils/auth";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function FriendHeaderView({ dict }: { dict: any }) {
  const router = useRouter();
  const handleLogout = () => {
    logout();
    toast.success(dict.login.logout_success);
    router.push("/sign-in");
  };
  return (
    <div className="flex flex-row items-center justify-between">
      <h2 className="text-lg font-semibold">{dict.dashboard.title}</h2>
      <LogOut className="size-6 cursor-pointer" onClick={handleLogout} />
      <ModeToggle />
    </div>
  );
}

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
    <div className="flex flex-row items-center justify-between p-4">
      {/* Logo and Brand */}
      <div
        className="flex items-center space-x-3 cursor-pointer"
        onClick={() => router.push("/")}
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Learn.io</h1>
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-3">
        <LogOut
          className="size-5 cursor-pointer text-gray-600 hover:text-gray-800"
          onClick={handleLogout}
        />
        <ModeToggle />
      </div>
    </div>
  );
}

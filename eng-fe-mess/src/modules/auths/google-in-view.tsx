import { USER_API } from "@/config";
import { Facebook, Github, Mail } from "lucide-react";

export default function GoogleInView() {
  const handleGoogleLogin = () => {
    window.location.href = USER_API + "/oauth2/authorization/google";
  };
  return (
    <div className="flex justify-center gap-2">
      <div
        className="border border-gray-300 rounded-md p-2 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleGoogleLogin}
        title="Login with Google"
      >
        <Mail className="size-6" />
      </div>
      <div className="border border-gray-300 rounded-md p-2 cursor-pointer">
        <Facebook className="size-6" />
      </div>
      <div className="border border-gray-300 rounded-md p-2 cursor-pointer">
        <Github className="size-6" />
      </div>
    </div>
  );
}

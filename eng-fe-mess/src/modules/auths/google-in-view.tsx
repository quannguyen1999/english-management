import { USER_API } from "@/config";

export default function GoogleInView() {
  const handleGoogleLogin = () => {
    window.location.href = USER_API + "/oauth2/authorization/google";
  };

  return (
    <div className="flex justify-center">
      <button
        onClick={handleGoogleLogin}
        className=" cursor-pointer flex items-center gap-3 px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        title="Sign in with Google"
      >
        {/* Google Icon - Simplified to prevent hydration issues */}
        <div className="w-5 h-5 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 via-yellow-500 to-green-500 flex items-center justify-center text-white font-bold text-xs">
            G
          </div>
        </div>

        <span>Sign in with Google</span>
      </button>
    </div>
  );
}

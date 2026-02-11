import SpeechToText from "@/components/SpeechToText";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4 font-sans dark:bg-zinc-950">
      <SpeechToText />
    </div>
  );
}

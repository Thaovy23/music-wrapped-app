import { Suspense } from "react";
import { WrappedContent } from "./WrappedContent";

export default function WrappedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-zinc-400">Loading wrapped…</div>
        </div>
      }
    >
      <WrappedContent />
    </Suspense>
  );
}

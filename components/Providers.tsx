"use client";

// We don't need Apollo anymore, so this is just a simple wrapper now.
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

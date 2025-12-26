import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/Providers"; // <--- Import this

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-jakarta",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "WorkSpotBD | The Workspace Platform",
  description: "Find the perfect remote-work friendly cafes in Dhaka.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-brand-light font-sans antialiased",
        jakarta.variable
      )}>
        {/* Wrap the children with our new Provider */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
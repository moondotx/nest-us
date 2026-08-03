import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/useAuth";
import NavbarWrapper from "@/components/layout/NavbarWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nest — Book Office & Living Spaces in Nigeria",
  description: "Find and book verified office spaces, apartments, hostels and hotels across Nigeria",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavbarWrapper />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

// Hide navbar on auth pages so the split layout fills the full viewport
const HIDE_ON = ["/login", "/signup", "/oauth"];

export default function NavbarWrapper() {
  const pathname = usePathname();
  if (HIDE_ON.includes(pathname)) return null;
  return <Navbar />;
}

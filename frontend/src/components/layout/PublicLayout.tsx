import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { MobileNav } from "./MobileNav";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-cream pb-16 font-sans text-ink md:pb-0">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}

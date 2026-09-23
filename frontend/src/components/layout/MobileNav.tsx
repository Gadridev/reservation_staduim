import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store";
import type { UserRole } from "../../features/auth/api";

interface MobileLink {
  to: string;
  icon: string;
  label: string;
  end?: boolean;
  roles?: UserRole[];
}

const MOBILE_LINKS: MobileLink[] = [
  { to: "/", icon: "⌂", label: "Home", end: true },
  { to: "/map", icon: "📍", label: "Explore", roles: ["PLAYER", "OWNER"] },
  { to: "/bookings", icon: "📅", label: "Bookings", roles: ["PLAYER"] },
  { to: "/owner", icon: "🏟️", label: "Owner", roles: ["OWNER"] },
  { to: "/owner/photos", icon: "📷", label: "Photos", roles: ["OWNER"] },
  { to: "/messages", icon: "💬", label: "Messages", roles: ["PLAYER", "OWNER"] },
  { to: "/notifications", icon: "🔔", label: "Alerts", roles: ["PLAYER", "OWNER"] },
];

export function MobileNav() {
  const user = useAuthStore((state) => state.user);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-amber bg-pitch-dark px-1 pb-2 pt-1.5 md:hidden">
      <div className="flex justify-around">
        {MOBILE_LINKS.filter(
          (link) => !link.roles || (user?.role ? link.roles.includes(user.role) : false),
        ).map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex min-w-[56px] flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-semibold ${
                isActive ? "text-amber" : "text-cream/55"
              }`
            }
          >
            <span className="text-lg" aria-hidden="true">
              {link.icon}
            </span>
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

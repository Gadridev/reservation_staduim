import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store";
import type { UserRole } from "../../features/auth/api";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { NotificationMenu } from "./NotificationMenu";

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  roles?: UserRole[];
}

const NAV_LINKS: NavItem[] = [
  { to: "/", label: "Discover", end: true },
  { to: "/map", label: "Map", roles: ["PLAYER", "OWNER"] },
  { to: "/bookings", label: "Bookings", roles: ["PLAYER"] },
  { to: "/dashboard", label: "Dashboard", roles: ["PLAYER"] },
  { to: "/owner", label: "Owner Dashboard", roles: ["OWNER"] },
  { to: "/owner/photos", label: "Photos", roles: ["OWNER"] },
];

export function Navbar() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  function logout() {
    localStorage.removeItem("accessToken");
    clearAuth();
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b-[3px] border-amber bg-pitch-dark px-7 py-4">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="font-display flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-amber text-xl font-black uppercase text-pitch-dark">
          M
        </span>
        <span className="font-display text-2xl tracking-wide text-cream">
          Malaab<span className="text-amber">.</span>
        </span>
      </Link>

      <nav className="hidden gap-1 rounded-xl bg-white/[0.06] p-1 md:flex">
        {NAV_LINKS.filter(
          (link) => !link.roles || (user?.role ? link.roles.includes(user.role) : false),
        ).map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `rounded-lg px-4 py-2.5 text-[13px] font-semibold tracking-wide transition-colors ${
                isActive
                  ? "bg-amber text-pitch-dark"
                  : "text-cream/65 hover:text-cream"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-2.5">
            <NotificationMenu />
            <Link to="/profile">
              <Avatar name={user.firstName} size="sm" />
            </Link>
            <span className="hidden text-sm font-semibold text-cream sm:inline">
              {user.firstName}
            </span>
            <Button variant="ghost-light" size="sm" onClick={logout}>
              Log out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3.5 py-2 text-[13px] font-semibold text-cream/80 hover:text-cream"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-amber px-4 py-2 text-[13px] font-bold text-pitch-dark hover:bg-amber-deep"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

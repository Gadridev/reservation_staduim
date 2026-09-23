import { Link, Outlet } from "react-router-dom";
export function AuthLayout() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden overflow-hidden bg-gradient-to-b from-pitch-dark to-pitch px-12 py-14 text-cream lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.035)_0_2px,transparent_2px_64px)] opacity-40" />

        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="font-display flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-amber text-xl font-black uppercase text-pitch-dark">
            M
          </span>
          <span className="font-display text-2xl tracking-wide text-cream">
            Malaab<span className="text-amber">.</span>
          </span>
        </Link>

        <div className="relative">
          <p className="mb-3 font-mono text-xs tracking-[0.18em] text-amber">
            NO MORE PHONE-CALL BOOKINGS
          </p>
          <h1 className="font-display max-w-md text-4xl font-black uppercase leading-[0.98] tracking-wide">
            Book the pitch.
            <br />
            Skip the <span className="text-amber">middleman.</span>
          </h1>
        </div>

        <p className="relative font-mono text-xs text-cream/50">
          Beni Mellal · Marrakech · Casablanca · Rabat
        </p>
      </div>

      <div className="flex items-center justify-center bg-cream px-6 py-14">
        <div className="w-full max-w-[400px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";

export function UnauthorizedPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-[720px] items-center px-7 py-16">
      <div className="w-full rounded-[18px] border border-line bg-chalk p-10 text-center">
        <span className="font-mono text-sm font-bold uppercase tracking-widest text-danger">
          Access denied
        </span>

        <h1 className="mt-4 font-display text-5xl font-black uppercase text-ink">
          You cannot access this page
        </h1>

        <p className="mx-auto mt-4 max-w-md text-ink-soft">
          This section is unavailable for your account role.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex rounded-lg bg-pitch-dark px-6 py-3 font-semibold text-cream transition-colors hover:bg-pitch"
        >
          Return home
        </Link>
      </div>
    </section>
  );
}

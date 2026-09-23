import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { loginSchema, type LoginFormValues } from "../features/auth/schemas";
import { useLogin } from "../features/auth/hooks/useLogin";

export function LoginPage() {
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  function onSubmit(values: LoginFormValues) {
    login(values);
  }

  return (
    <div>
      <h1 className="font-display mb-2 text-3xl font-black uppercase tracking-wide text-ink">
        Welcome back
      </h1>
      <p className="mb-8 text-sm text-ink-soft">
        Log in to book your next game.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-lg border border-line bg-chalk px-4 py-2.5 focus-within:border-turf">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <div className="rounded-lg border border-line bg-chalk px-4 py-2.5 focus-within:border-turf">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-ink-soft hover:text-ink"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" isLoading={isPending} className="w-full">
          {isPending ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-turf hover:text-turf-light"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

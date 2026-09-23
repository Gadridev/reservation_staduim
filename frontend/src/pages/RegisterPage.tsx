import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { registerSchema, type RegisterFormValues } from "../features/auth/schemas";

import {  type UserRole } from "../features/auth/api";
import { useRegister } from "../features/auth/hooks/useRegister";

const ACCOUNT_TYPES: { value: UserRole; label: string; blurb: string }[] = [
  { value: "PLAYER", label: "I play football", blurb: "Find and book stadiums" },
  { value: "OWNER", label: "I manage a stadium", blurb: "List and manage bookings" },
];

export function RegisterPage() {
  const [accountType, setAccountType] = useState<UserRole>("PLAYER");
  const {isPending,mutate:requestRegister}=useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  function onSubmit(values: RegisterFormValues) {
    requestRegister(values)

  }

  return (
    <div>
      <h1 className="font-display mb-2 text-3xl font-black uppercase tracking-wide text-ink">
        Create your account
      </h1>
      <p className="mb-6 text-sm text-ink-soft">Join Malaab in less than a minute.</p>

      <div className="mb-6 grid grid-cols-2 gap-2.5">
        {ACCOUNT_TYPES.map((type) => {
          const isActive = accountType === type.value;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => setAccountType(type.value)}
              className={`rounded-lg border px-3.5 py-3 text-left transition-colors ${
                isActive ? "border-turf bg-turf/10" : "border-line bg-chalk hover:border-ink-soft/40"
              }`}
            >
              <span className={`block text-[13px] font-bold ${isActive ? "text-turf" : "text-ink"}`}>
                {type.label}
              </span>
              <span className="text-[11px] text-ink-soft">{type.blurb}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-line bg-chalk px-4 py-2.5 focus-within:border-turf">
            <Input label="First name" placeholder="Ahmed" error={errors.firstName?.message} {...register("firstName")} />
          </div>
          <div className="rounded-lg border border-line bg-chalk px-4 py-2.5 focus-within:border-turf">
            <Input label="Last name" placeholder="El Amrani" error={errors.lastName?.message} {...register("lastName")} />
          </div>
        </div>

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
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <div className="rounded-lg border border-line bg-chalk px-4 py-2.5 focus-within:border-turf">
          <Input
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>

        <Button type="submit" isLoading={isPending} className="w-full">
          {isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-turf hover:text-turf-light">
          Log in
        </Link>
      </p>
    </div>
  );
}

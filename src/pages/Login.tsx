import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import apiClient from "@/services/api-client";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Boxes, ChartNoAxesCombined, Warehouse } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });

  const [error, setError] = useState<string | null>("");

  const onSubmit = async (data: FormData) => {
    setError("");

    try {
      const res = await apiClient.post("/auth", data);
      localStorage.setItem("x-auth-token", res.data);
      window.location.href = "/";
    } catch (err: any) {
      if (err.status == 400) setError("Invalid credentials");
      else setError("An expected error occured");
    }
  };

  return (
    <div className="app-canvas min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-3xl border border-white/70 bg-white/60 shadow-2xl shadow-slate-900/10 backdrop-blur sm:min-h-[calc(100vh-3rem)] lg:grid-cols-2 lg:min-h-[calc(100vh-4rem)]">
        <section className="relative isolate flex min-h-72 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-7 text-white sm:p-10 lg:min-h-[680px] lg:p-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-28 -top-28 -z-10 size-96 rounded-full border border-emerald-300/15"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-24 -z-10 size-[30rem] rounded-full bg-emerald-400/10 blur-3xl"
          />
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/30">
                <Warehouse aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold tracking-[0.12em]">
                  STOCK MANAGER
                </p>
                <p className="mt-0.5 text-xs text-slate-300">
                  Inventory workspace
                </p>
              </div>
            </div>

            <div className="mt-12 max-w-lg sm:mt-16 lg:mt-24">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Make every item count
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
                A clearer view of stock.
                <span className="mt-2 block text-emerald-300">
                  A stronger way to run your business.
                </span>
              </h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-slate-300 sm:text-base">
                Bring your inventory, movements, and decisions together in one
                calm, dependable workspace.
              </p>
            </div>
          </div>

          <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
              <Boxes aria-hidden="true" className="size-5 text-emerald-300" />
              <p className="mt-3 text-sm font-medium">Know what you have</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Keep stock details close at hand.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
              <ChartNoAxesCombined
                aria-hidden="true"
                className="size-5 text-emerald-300"
              />
              <p className="mt-3 text-sm font-medium">Move with confidence</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                See the signals behind your next step.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white/80 px-6 py-10 sm:px-12 lg:px-14">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-md space-y-6"
          >
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Welcome back
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                Sign in to your workspace
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your stockroom is ready when you are.
              </p>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  {...register("email")}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...register("password")}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
                {errors.password && (
                  <p
                    id="password-error"
                    className="mt-1.5 text-sm text-red-600"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20"
            >
              Sign in
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </button>

            <p className="text-center text-sm text-slate-500">
              New to Stock Manager?{" "}
              <Link
                to="/register"
                className="font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
              >
                Create an account
              </Link>
            </p>
            <p className="border-t border-slate-100 pt-5 text-center text-xs text-slate-400">
              Built to make everyday inventory decisions feel simpler.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

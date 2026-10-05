import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import apiClient from "@/services/api-client";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Boxes,
  ChartNoAxesCombined,
  CheckCircle,
  Warehouse,
  XCircle,
} from "lucide-react";
import { z } from "zod";

const schema = z
  .object({
    username: z.string().min(5, "Username must be at least 5 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const password = watch("password");
  const confirm = watch("confirm");
  const passwordsMatch = password && confirm && password === confirm;
  const showPasswordMatch = Boolean(password && confirm);

  const onSubmit = async (data: FormData) => {
    setError("");
    setSuccess("");

    try {
      const res = await apiClient.post("/users", {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      const token = res.headers["x-auth-token"];
      localStorage.setItem("x-auth-token", token);
      setSuccess("Account created successfully. You can now log in.");
      reset();
      window.location.href = "/";
    } catch (err: any) {
      if (err.status == 400) setError("Email Already Registered try to login");
      else setError("An expected error occured");
    }
  };

  return (
    <div className="register-page login-page app-canvas flex min-h-dvh items-center justify-center p-3 sm:p-5 lg:h-dvh lg:min-h-0 lg:overflow-hidden lg:p-6">
      <div className="login-card mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/70 bg-white/60 shadow-2xl shadow-slate-900/10 backdrop-blur lg:h-full lg:max-h-[800px] lg:grid-cols-2">
        <section className="relative isolate hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-8 text-white lg:flex xl:p-12">
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

            <div className="mt-8 max-w-lg xl:mt-12">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Make every item count
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-[1.08] tracking-tight xl:text-5xl">
                A clearer view of stock.
                <span className="mt-1 block text-emerald-300">
                  A stronger way to run your business.
                </span>
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                Bring your inventory, movements, and decisions together in one
                calm, dependable workspace.
              </p>
            </div>
          </div>

          <div className="mt-6 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-sm">
              <Boxes aria-hidden="true" className="size-5 text-emerald-300" />
              <p className="mt-2 text-sm font-medium">Know what you have</p>
              <p className="mt-1 text-xs leading-4 text-slate-400">
                Keep stock details close at hand.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-sm">
              <ChartNoAxesCombined
                aria-hidden="true"
                className="size-5 text-emerald-300"
              />
              <p className="mt-2 text-sm font-medium">Move with confidence</p>
              <p className="mt-1 text-xs leading-4 text-slate-400">
                See the signals behind your next step.
              </p>
            </div>
          </div>
        </section>

        <section className="login-form-panel flex items-center justify-center bg-white/85 px-6 py-5 sm:px-12 sm:py-8 lg:px-10 lg:py-6 xl:px-14">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="register-form login-form w-full max-w-md space-y-4 sm:space-y-5"
          >
            <div className="login-mobile-brand mb-4 flex items-center gap-3 lg:hidden">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                <Warehouse aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold tracking-[0.12em] text-slate-900">
                  STOCK MANAGER
                </p>
                <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
                  Inventory workspace
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Get started
              </p>
              <h2 className="login-heading mt-1 text-3xl font-semibold tracking-tight text-slate-900 sm:mt-2">
                <span className="sm:hidden">Create account</span>
                <span className="hidden sm:inline">
                  Create your workspace
                </span>
              </h2>
              <p className="login-intro mt-2 hidden text-sm leading-6 text-slate-500 sm:block">
                Set up your account and bring your inventory into focus.
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
            {success && (
              <p
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              >
                {success}
              </p>
            )}

            <div className="register-fields login-fields space-y-3 sm:space-y-3.5">
              <div className="login-field">
                <label
                  htmlFor="username"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Choose a username"
                  {...register("username")}
                  aria-invalid={Boolean(errors.username)}
                  aria-describedby={
                    errors.username ? "username-error" : undefined
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:py-3"
                />
                {errors.username && (
                  <p
                    id="username-error"
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="login-field">
                <label
                  htmlFor="register-email"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  {...register("email")}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "register-email-error" : undefined}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:py-3"
                />
                {errors.email && (
                  <p
                    id="register-email-error"
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="login-field">
                <label
                  htmlFor="register-password"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  {...register("password")}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "register-password-error" : undefined
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:py-3"
                />
                {errors.password && (
                  <p
                    id="register-password-error"
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="login-field">
                <label
                  htmlFor="confirm-password"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter your password again"
                    {...register("confirm")}
                    aria-invalid={Boolean(errors.confirm)}
                    aria-describedby={
                      errors.confirm ? "confirm-password-error" : undefined
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-11 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:py-3"
                  />
                  {showPasswordMatch && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {passwordsMatch ? (
                        <CheckCircle
                          aria-label="Passwords match"
                          className="size-5 text-emerald-600"
                        />
                      ) : (
                        <XCircle
                          aria-label="Passwords do not match"
                          className="size-5 text-red-500"
                        />
                      )}
                    </span>
                  )}
                </div>
                {errors.confirm && (
                  <p
                    id="confirm-password-error"
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.confirm.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20"
            >
              Create account
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

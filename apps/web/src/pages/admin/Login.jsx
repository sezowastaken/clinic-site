import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { doctor } from "../../content/doctor";

export default function Login() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  if (status === "authenticated") {
    return <Navigate to="/admin" replace />;
  }

  async function onSubmit(data) {
    setError("");
    setSubmitting(true);
    const result = await login(data.identifier, data.password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    navigate("/admin", { replace: true });
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-text)] px-4">
      <div className="w-full max-w-sm rounded-xl border border-[var(--color-border)] p-6 sm:p-8">
        <h1 className="text-xl font-bold text-center">{doctor.name}</h1>
        <p className="mt-1 text-center text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)]">
          Personel Girişi
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="identifier">
              E-posta veya Kullanıcı Adı
            </label>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              {...register("identifier", { required: true })}
              className="w-full h-10 border border-[var(--color-border)] rounded-lg px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            />
            {errors.identifier && <p className="mt-1 text-xs text-red-600">E-posta veya kullanıcı adı gereklidir.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password", { required: true })}
              className="w-full h-10 border border-[var(--color-border)] rounded-lg px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">Şifre gereklidir.</p>}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-10 rounded-lg text-sm font-semibold text-white bg-[var(--color-primary)] hover:-translate-y-0.5 active:translate-y-0 transition shadow hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <Link
          to="/"
          className="mt-4 block text-center text-sm text-[color-mix(in srgb, var(--color-text) 60%, transparent)] hover:text-[var(--color-primary)]"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}

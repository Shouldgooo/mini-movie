"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch, storeToken } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useGuestPage } from "@/lib/useGuestPage";
import {
  MAX_REGISTER_PASSWORD_LENGTH,
  MIN_REGISTER_PASSWORD_LENGTH,
  isValidEmail,
  usernameFromEmail,
} from "@/lib/register";

export default function RegisterPage() {
  const router = useRouter();
  useGuestPage();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function validate(): string | null {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return t("registerEmailRequired");
    }

    if (!isValidEmail(trimmedEmail)) {
      return t("registerEmailInvalid");
    }

    if (!password) {
      return t("registerPasswordRequired");
    }

    if (password.length < MIN_REGISTER_PASSWORD_LENGTH) {
      return t("registerPasswordShort");
    }

    if (password !== confirmPassword) {
      return t("registerMismatch");
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsLoading(true);

    const trimmedEmail = email.trim();

    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: usernameFromEmail(trimmedEmail),
          email: trimmedEmail,
          password,
        }),
      });

      const data = await apiFetch<{ token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: trimmedEmail,
          password,
        }),
      });

      storeToken(data.token);
      router.push("/my");
    } catch (submitError) {
      console.error(submitError);

      if (submitError instanceof ApiError && submitError.status === 409) {
        setError(t("registerEmailTaken"));
        return;
      }

      setError(t("registerFail"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col px-4 py-20 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        {t("registerTitle")}
      </h1>
      <p className="mt-3 text-sm text-muted">{t("registerLead")}</p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6" noValidate>
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm">
            {t("email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full border-b border-border bg-transparent py-2 text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm">
            {t("password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={MIN_REGISTER_PASSWORD_LENGTH}
            maxLength={MAX_REGISTER_PASSWORD_LENGTH}
            className="w-full border-b border-border bg-transparent py-2 text-sm outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm">
            {t("confirmPassword")}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={MIN_REGISTER_PASSWORD_LENGTH}
            maxLength={MAX_REGISTER_PASSWORD_LENGTH}
            className="w-full border-b border-border bg-transparent py-2 text-sm outline-none"
          />
        </div>

        {error && (
          <p className="text-sm text-neutral-300" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-white py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {isLoading ? t("registering") : t("registerAction")}
        </button>
      </form>

      <p className="mt-10 text-sm text-muted">
        <Link
          href="/login"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          {t("registerHasAccount")}
        </Link>
      </p>
    </main>
  );
}

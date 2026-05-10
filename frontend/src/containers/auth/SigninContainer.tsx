"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { StatusMessage } from "@/components/common/StatusMessage";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { saveAuthSession } from "@/lib/auth/session";
import { ROUTES } from "@/routes/paths";
import styles from "@/components/auth/authForm.module.css";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to sign in. Please try again.";
};

export function SigninContainer() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);

    try {
      const response = await authApi.login({
        email: email.trim(),
        password,
      });

      saveAuthSession({
        accessToken: response.Result.accessToken,
        user: response.Result.sendUser,
      });

      setStatus({
        tone: "success",
        message: "Signed in. Redirecting to home.",
      });

      window.setTimeout(() => router.push(ROUTES.home), 600);
    } catch (error) {
      setStatus({
        tone: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in and continue your job matching flow."
      copy="Access resume uploads, match scores, applications, recruiter jobs, and live updates from one workspace."
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <p>Sign in</p>
          <h2>Welcome back.</h2>
          <span>Use your candidate or recruiter credentials.</span>
        </div>

        <div className={styles.fields}>
          {status ? (
            <StatusMessage tone={status.tone} message={status.message} />
          ) : null}

          <AuthTextField
            autoComplete="email"
            icon={Mail}
            id="email"
            label="Email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />

          <AuthTextField
            autoComplete="current-password"
            icon={Lock}
            id="password"
            label="Password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            required
            type="password"
            value={password}
          />
        </div>

        <button
          className={styles.submitButton}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
          <ArrowRight size={18} />
        </button>

        <p className={styles.switchText}>
          New to Syncup? <Link href={ROUTES.register}>Create account</Link>
        </p>
      </form>
    </AuthShell>
  );
}

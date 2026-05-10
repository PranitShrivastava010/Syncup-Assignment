"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthTextField } from "@/components/auth/AuthTextField";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { StatusMessage } from "@/components/common/StatusMessage";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { ROUTES } from "@/routes/paths";
import type { AuthRole } from "@/types/auth";
import styles from "@/components/auth/authForm.module.css";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to create account. Please try again.";
};

export function SignupContainer() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AuthRole>("CANDIDATE");
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
      await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      setStatus({
        tone: "success",
        message: "Account created. Redirecting to sign in.",
      });

      window.setTimeout(() => router.push(ROUTES.login), 700);
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
      eyebrow="Create account"
      title="Start matching roles with better context."
      copy="Create a candidate account for resume matching or a recruiter account to post jobs and review applications."
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <p>Sign up</p>
          <h2>Create your account.</h2>
          <span>Use the role selector to choose the correct workspace.</span>
        </div>

        <div className={styles.fields}>
          {status ? (
            <StatusMessage tone={status.tone} message={status.message} />
          ) : null}

          <AuthTextField
            autoComplete="name"
            icon={User}
            id="name"
            label="Full name"
            minLength={2}
            onChange={(event) => setName(event.target.value)}
            placeholder="Priya Sharma"
            required
            type="text"
            value={name}
          />

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
            autoComplete="new-password"
            icon={Lock}
            id="password"
            label="Password"
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 6 characters"
            required
            type="password"
            value={password}
          />

          <RoleSelector value={role} onChange={setRole} />
        </div>

        <button
          className={styles.submitButton}
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
          <ArrowRight size={18} />
        </button>

        <p className={styles.switchText}>
          Already have an account? <Link href={ROUTES.login}>Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}

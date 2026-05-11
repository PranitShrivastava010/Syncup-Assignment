"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession } from "@/lib/auth/session";
import { ROUTES } from "@/routes/paths";
import {
  BellRing,
  BrainCircuit,
  FileUp,
  SearchCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import styles from "./page.module.css";

const features = [
  {
    icon: FileUp,
    title: "Resume Intelligence",
    text: "Candidates upload a resume once and Syncup extracts the signal needed for matching.",
  },
  {
    icon: BrainCircuit,
    title: "AI Match Scores",
    text: "Groq compares resume context with job requirements and highlights fit, gaps, and next moves.",
  },
  {
    icon: SearchCheck,
    title: "Curated Jobs",
    text: "Recruiters post roles inside the platform, while candidates search cached job listings quickly.",
  },
  {
    icon: BellRing,
    title: "Live Updates",
    text: "WebSocket notifications keep applications and status changes visible as they happen.",
  },
];

const stats = [
  { label: "Match score", value: "92%" },
  { label: "Skills found", value: "18" },
  { label: "Missing gaps", value: "3" },
];

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const session = getAuthSession();
    if (session) {
      router.replace(
        session.user.role === "RECRUITER" ? ROUTES.recruiter : ROUTES.candidateJobs
      );
    }
  }, [router]);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <nav className={styles.nav} aria-label="Primary navigation">
          <a className={styles.brand} href="/">
            <span>Syncup</span>
          </a>
          <div className={styles.navActions}>
            <a href="#features">Features</a>
            <a className={styles.navButton} href="/login">
              Sign in
            </a>
          </div>
        </nav>

        <div className={styles.heroShell}>
          <div className={styles.heroContent}>
            <p className={styles.kicker}>
              <Sparkles size={16} />
              AI job matching workspace
            </p>
            <h1>Syncup</h1>
            <p className={styles.heroCopy}>
              A hiring platform where candidates upload resumes, recruiters post
              jobs, and AI turns applications into clear match signals.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="/register">
                Get started
              </a>
              <a className={styles.secondaryAction} href="#features">
                Explore features
              </a>
            </div>
          </div>

          <div className={styles.scene} aria-hidden="true">
            <div className={`${styles.panel} ${styles.resumePanel}`}>
              <div className={styles.panelHeader}>
                <span />
                <span />
                <span />
              </div>
              <div className={styles.resumeName}>Priya Sharma</div>
              <div className={styles.resumeRole}>Full Stack Engineer</div>
              <div className={styles.resumeLines}>
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className={styles.skillGrid}>
                <span>React</span>
                <span>Node</span>
                <span>Prisma</span>
                <span>Redis</span>
              </div>
            </div>

            <div className={`${styles.panel} ${styles.matchPanel}`}>
              <div className={styles.scoreRing}>
                <span>92</span>
              </div>
              <div>
                <p>Backend Node.js Developer</p>
                <strong>CloudMint Labs</strong>
              </div>
            </div>

            <div className={`${styles.panel} ${styles.jobPanel}`}>
              <div className={styles.jobRow}>
                <span className={styles.jobDot} />
                <div>
                  <strong>AI Integration Engineer</strong>
                  <p>Groq / TypeScript / PostgreSQL</p>
                </div>
              </div>
              <div className={styles.jobRow}>
                <span className={styles.jobDotAlt} />
                <div>
                  <strong>Full Stack Engineer</strong>
                  <p>Next.js / WebSockets / Cloudinary</p>
                </div>
              </div>
            </div>

            <div className={styles.matchLineOne} />
            <div className={styles.matchLineTwo} />
          </div>
        </div>
      </section>

      <section id="features" className={styles.featureBand}>
        <div className={styles.sectionIntro}>
          <p>Core Flow</p>
          <h2>Built around the assignment requirements.</h2>
        </div>
        <div className={styles.featureGrid}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className={styles.featureCard} key={feature.title}>
                <div className={styles.featureIcon}>
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.workflowBand}>
        <div className={styles.workflow}>
          <div>
            <p className={styles.sectionLabel}>Candidate Journey</p>
            <h2>Register, upload, match, apply.</h2>
            <p>
              The product path stays simple on purpose: authenticated users can
              manage resumes, compare against jobs, submit applications, and
              receive live updates.
            </p>
          </div>
          <div className={styles.statGrid}>
            {stats.map((stat) => (
              <div className={styles.statCard} key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.securityBand}>
        <ShieldCheck size={28} />
        <p>
          Find, Match and Succeed
        </p>
      </section>
    </main>
  );
}

import Link from "next/link";
import { BriefcaseBusiness, FileSearch, ShieldCheck } from "lucide-react";
import { ROUTES } from "@/routes/paths";
import styles from "./authShell.module.css";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  copy: string;
  children: React.ReactNode;
};

const highlights = [
  {
    icon: FileSearch,
    label: "Resume matching",
  },
  {
    icon: BriefcaseBusiness,
    label: "Recruiter jobs",
  },
  {
    icon: ShieldCheck,
    label: "Secure cookies",
  },
];

export function AuthShell({ eyebrow, title, copy, children }: AuthShellProps) {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <Link className={styles.brand} href={ROUTES.home}>
          <span>Syncup</span>
        </Link>

        <div className={styles.copy}>
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          <span>{copy}</span>
        </div>

        <div className={styles.preview} aria-hidden="true">
          <div className={styles.score}>92</div>
          <div>
            <strong>Backend Node.js Developer</strong>
            <span>CloudMint Labs</span>
          </div>
        </div>

        <div className={styles.highlights}>
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div className={styles.highlight} key={item.label}>
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.formPanel}>{children}</section>
    </main>
  );
}

"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Job, JobFormPayload } from "@/types/recruiter";
import styles from "./recruiter.module.css";

type JobFormProps = {
  initialJob?: Job;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (payload: JobFormPayload) => Promise<void>;
};

const getInitialValue = (job?: Job): JobFormPayload => ({
  title: job?.title ?? "",
  companyName: job?.companyName ?? "",
  location: job?.location ?? "",
  employmentType: job?.employmentType ?? "Full-time",
  salaryMin: job?.salaryMin ?? undefined,
  salaryMax: job?.salaryMax ?? undefined,
  isRemote: job?.isRemote ?? false,
  description: job?.description ?? "",
  requirements: job?.requirements ?? "",
});

export function JobForm({
  initialJob,
  submitLabel,
  isSubmitting,
  onSubmit,
}: JobFormProps) {
  const initialValue = useMemo(() => getInitialValue(initialJob), [initialJob]);
  const [form, setForm] = useState<JobFormPayload>(initialValue);

  const updateField = <Key extends keyof JobFormPayload>(
    key: Key,
    value: JobFormPayload[Key]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      ...form,
      salaryMin: form.salaryMin || undefined,
      salaryMax: form.salaryMax || undefined,
      requirements: form.requirements?.trim() || undefined,
    });
  };

  return (
    <form className={styles.jobForm} onSubmit={handleSubmit}>
      <div className={styles.formGrid}>
        <label>
          <span>Job title</span>
          <input
            minLength={2}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Backend Node.js Developer"
            required
            value={form.title}
          />
        </label>

        <label>
          <span>Company</span>
          <input
            minLength={2}
            onChange={(event) => updateField("companyName", event.target.value)}
            placeholder="CloudMint Labs"
            required
            value={form.companyName}
          />
        </label>

        <label>
          <span>Location</span>
          <input
            minLength={2}
            onChange={(event) => updateField("location", event.target.value)}
            placeholder="Hyderabad, India"
            required
            value={form.location}
          />
        </label>

        <label>
          <span>Employment type</span>
          <select
            onChange={(event) =>
              updateField("employmentType", event.target.value)
            }
            required
            value={form.employmentType}
          >
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </select>
        </label>

        <label>
          <span>Minimum salary</span>
          <input
            min={1}
            onChange={(event) =>
              updateField(
                "salaryMin",
                event.target.value ? Number(event.target.value) : undefined
              )
            }
            placeholder="900000"
            type="number"
            value={form.salaryMin ?? ""}
          />
        </label>

        <label>
          <span>Maximum salary</span>
          <input
            min={1}
            onChange={(event) =>
              updateField(
                "salaryMax",
                event.target.value ? Number(event.target.value) : undefined
              )
            }
            placeholder="1600000"
            type="number"
            value={form.salaryMax ?? ""}
          />
        </label>
      </div>

      <label className={styles.toggleRow}>
        <input
          checked={form.isRemote}
          onChange={(event) => updateField("isRemote", event.target.checked)}
          type="checkbox"
        />
        <span>Remote role</span>
      </label>

      <label>
        <span>Description</span>
        <textarea
          minLength={10}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="Describe the role, ownership areas, and team context."
          required
          rows={5}
          value={form.description}
        />
      </label>

      <label>
        <span>Requirements</span>
        <textarea
          onChange={(event) => updateField("requirements", event.target.value)}
          placeholder="Node.js, Express, PostgreSQL, Prisma, Redis..."
          rows={4}
          value={form.requirements ?? ""}
        />
      </label>

      <button className={styles.primaryButton} disabled={isSubmitting} type="submit">
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

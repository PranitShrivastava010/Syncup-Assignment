import type { AuthRole } from "@/types/auth";
import styles from "./authForm.module.css";

type RoleSelectorProps = {
  value: AuthRole;
  onChange: (role: AuthRole) => void;
};

const roles: Array<{ label: string; value: AuthRole }> = [
  { label: "Candidate", value: "CANDIDATE" },
  { label: "Recruiter", value: "RECRUITER" },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className={styles.roleGroup}>
      <span>Account type</span>
      <div className={styles.roleOptions}>
        {roles.map((role) => (
          <button
            className={value === role.value ? styles.roleActive : ""}
            key={role.value}
            type="button"
            onClick={() => onChange(role.value)}
          >
            {role.label}
          </button>
        ))}
      </div>
    </div>
  );
}

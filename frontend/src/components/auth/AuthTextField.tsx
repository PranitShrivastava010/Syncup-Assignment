import type { ComponentType, InputHTMLAttributes } from "react";
import styles from "./authForm.module.css";

type AuthTextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
};

export function AuthTextField({
  label,
  icon: Icon,
  id,
  ...inputProps
}: AuthTextFieldProps) {
  return (
    <label className={styles.field} htmlFor={id}>
      <span>{label}</span>
      <div className={styles.inputWrap}>
        <Icon size={18} strokeWidth={2.2} />
        <input id={id} {...inputProps} />
      </div>
    </label>
  );
}

import styles from "./statusMessage.module.css";

type StatusMessageProps = {
  tone: "success" | "error";
  message: string;
};

export function StatusMessage({ tone, message }: StatusMessageProps) {
  return <p className={`${styles.message} ${styles[tone]}`}>{message}</p>;
}

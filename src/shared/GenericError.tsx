import React from "react";
import styles from "./GenericError.module.scss";

export function GenericError({
  message,
  header,
  footer,
}: {
  message: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <article className={styles.container}>
      {header && <header>{header}</header>}
      {message}
      {footer && <footer>{footer}</footer>}
    </article>
  );
}

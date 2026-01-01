import { Link } from "@tanstack/react-router";
import styles from "./Header.module.scss";

export function Header() {
  return (
    <>
      <hgroup>
        <h1 className={styles.header}>Pickle Jar</h1>
      </hgroup>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/sources">Sources</Link>
          </li>
        </ul>
      </nav>
    </>
  );
}

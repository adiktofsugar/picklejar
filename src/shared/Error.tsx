import styles from './Error.module.scss'

export function Error({ message }: { message:string }) {
    return (
        <article>
            <header className={styles.error}>Error</header>
            <p>{message}</p>
        </article>
    )
}
import styles from "./SourceErrorFallback.module.scss";
import farmerImg from "../../../assets/pickle-farmer-mouth-open.jpg";

export function SourceErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => unknown;
}) {
  return (
    <div className={styles.container}>
      <div>
        <p>{error.message}</p>
        <div>
          <button
            onClick={(e) => {
              e.preventDefault();
              resetErrorBoundary();
            }}
          >
            Try again
          </button>
        </div>
      </div>

      <div>
        <img src={farmerImg} alt="pickle farmer with open mouth" />
      </div>
    </div>
  );
}

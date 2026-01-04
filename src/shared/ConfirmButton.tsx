import { ButtonHTMLAttributes, useState } from "react";

export function ConfirmButton({
  onClick,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const [pending, setPending] = useState(false);

  if (pending) {
    return (
      <div>
        <button
          onClick={(e) => {
            setPending(false);
            onClick?.(e);
          }}
          className="primary"
        >
          Confirm
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            setPending(false);
          }}
          className="secondary"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      {...rest}
      onClick={(e) => {
        e.preventDefault();
        setPending(true);
      }}
    />
  );
}

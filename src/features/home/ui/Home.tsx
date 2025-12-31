import { useState } from "react";

export function Home() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Picklejar - oh yeah</h1>
      <div>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  );
}

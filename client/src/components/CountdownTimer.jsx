import { useEffect, useState } from "react";
export default function CountdownTimer({ endTime }) {
  const [left, setLeft] = useState(Math.max(0, endTime - Date.now()));
  useEffect(() => {
    const timer = setInterval(
      () => setLeft(Math.max(0, endTime - Date.now())),
      100,
    );
    return () => clearInterval(timer);
  }, [endTime]);
  return (
    <div className={`timer ${left < 5000 ? "timer-alert" : ""}`}>
      {Math.ceil(left / 1000)}
    </div>
  );
}

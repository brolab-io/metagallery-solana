"use client";
import { useEffect, useState } from "react";

type Props = {
  unixTime: number;
};

const Countdown = ({ unixTime }: Props) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = unixTime - now;
      if (timeLeft <= 0) {
        setIsExpired(true);
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }
      setTimeLeft(timeLeft);
    };
    calculateTimeLeft();
    interval = setInterval(calculateTimeLeft, 1000);
    return () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
  }, [unixTime]);

  if (isExpired) {
    return <span>00:00:00</span>;
  }

  const hours = Math.floor(timeLeft / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((timeLeft % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(timeLeft % 60)
    .toString()
    .padStart(2, "0");

  return (
    <span>
      {hours}:{minutes}:{seconds}
    </span>
  );
};

export default Countdown;

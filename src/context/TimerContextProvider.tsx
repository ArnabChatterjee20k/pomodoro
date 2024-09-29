import { useContext, createContext, useState, PropsWithChildren } from "react";

interface ITimer {
  interval: number;
  breakTime: number;
}

const defaultTimer: ITimer = {
  interval: 60 * 60,
  breakTime: 25 * 60,
};

const TimerContext = createContext<ITimer | null>(null);
export const useTimerContext = () => useContext(TimerContext) as ITimer;

export default function TimerContextProvider({ children }: PropsWithChildren) {
  const [intervalTime, setIntervalTime] = useState(defaultTimer.interval);
  const [breakTime, setBreakTime] = useState(defaultTimer.breakTime);
  return (
    <TimerContext.Provider
      value={{ interval: intervalTime, breakTime: breakTime }}
    >
      {children}
    </TimerContext.Provider>
  );
}

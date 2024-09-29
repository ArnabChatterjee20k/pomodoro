import { showNotification } from "@/lib/utils";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { persist } from "zustand/middleware";

export interface ITimer {
  interval: number;
  breakTime: number;
}

interface IStore extends ITimer {
  defaultInterval: number; // New field for default interval
  defaultBreakTime: number; // New field for default break time
  setter: (target: string, value: number | SetterFunction) => void;
  reset: (target: keyof ITimer) => void;
  isRunning: Record<keyof ITimer, boolean>;
  startTimer: (target: keyof ITimer) => void;
  pauseTimer: (target: keyof ITimer) => void;
  resetTimer: (target: keyof ITimer) => void;
}

type SetterFunction = (prevValue: number) => number;
const localdata = localStorage.getItem("TimeStore");
const storage = localdata ? JSON.parse(localdata) : {};

export const defaultInterval = storage?.state?.defaultInterval || 60 * 60; // 1 hour default
export const defaultBreakTime = storage?.state?.defaultBreakTime || 25 * 60; // 25 minutes default

export const defaultTimer: ITimer = {
  interval: storage?.state?.interval || defaultInterval,
  breakTime: storage?.state?.breakTime || defaultBreakTime,
};

export const useTimeStore = create<IStore>()(
  devtools(
    persist(
      (set, get) => {
        let intervalIds: Partial<Record<keyof ITimer, NodeJS.Timeout>> = {};

        return {
          ...defaultTimer,
          defaultInterval, // Assigning the defaultInterval
          defaultBreakTime, // Assigning the defaultBreakTime
          isRunning: { interval: false, breakTime: false },

          setter: (target: string, value: number | SetterFunction) =>
            set((state) => {
              const currentValue = state[target];
              const newValue =
                typeof value === "function"
                  ? (value as SetterFunction)(currentValue)
                  : value;

              return {
                ...state,
                [target]: newValue,
              };
            }),

          reset: (target: keyof ITimer) =>
            set((state) => ({
              ...state,
              [target]:
                target === "interval" ? defaultInterval : defaultBreakTime,
            })),

          startTimer: (target: keyof ITimer) => {
            const isRunning = get().isRunning[target];
            if (!isRunning) {
              Object.entries(intervalIds).forEach(([targetKey, intervalId]) => {
                if (target !== targetKey)
                  get().pauseTimer(targetKey as keyof ITimer);
              });
              set((state) => ({
                ...state,
                isRunning: {
                  ...state.isRunning,
                  [target]: true,
                },
              }));

              const intervalId = setInterval(() => {
                get().setter(target, (prevValue) => {
                  if (prevValue > 0) return prevValue - 1;
                  get().pauseTimer(target);
                  get().resetTimer(target);
                  showNotification(`${target} is completed`);
                  return 0;
                });
              }, 1000);

              intervalIds[target] = intervalId;
            }
          },

          pauseTimer: (target: keyof ITimer) => {
            if (intervalIds[target]) {
              clearInterval(intervalIds[target]!);
              delete intervalIds[target];
            }

            set((state) => ({
              ...state,
              isRunning: {
                ...state.isRunning,
                [target]: false,
              },
            }));
          },

          resetTimer: (target: keyof ITimer) => {
            get().pauseTimer(target);
            set((state) => ({
              ...state,
              [target]:
                target === "interval"
                  ? get().defaultInterval
                  : get().defaultBreakTime,
            }));
          },
        };
      },
      {
        name: "TimeStore",
      }
    )
  )
);

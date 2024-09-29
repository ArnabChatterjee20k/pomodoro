import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ITimer {
  interval: number;
  breakTime: number;
}

interface IStore extends ITimer {
  setter: (target: keyof ITimer, value: number | SetterFunction) => void;
  reset: (target: keyof ITimer) => void;
  isRunning: Record<keyof ITimer, boolean>;
  startTimer: (target: keyof ITimer) => void;
  pauseTimer: (target: keyof ITimer) => void;
  resetTimer: (target: keyof ITimer) => void;
}

type SetterFunction = (prevValue: number) => number;
const localdata = localStorage.getItem("TimeStore");
const storage = localdata ? JSON.parse(localdata) : {};

export const defaultTimer: ITimer = {
  interval: storage["state"]["interval"] || 60 * 60, // 1 hour
  breakTime: storage["state"]["breakTime"] || 25 * 60, // 25 minutes
};

export const useTimeStore = create<IStore>()(
  devtools(
    persist(
      (set, get) => {
        let intervalIds: Partial<Record<keyof ITimer, NodeJS.Timeout>> = {};

        return {
          ...defaultTimer,
          isRunning: { interval: false, breakTime: false },

          setter: (target: keyof ITimer, value: number | SetterFunction) =>
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
              [target]: defaultTimer[target],
            })),

          startTimer: (target: keyof ITimer) => {
            const isRunning = get().isRunning[target];
            if (!isRunning) {
              Object.entries(intervalIds).map(([targetKey, intervalId]) => {
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
            const storage = JSON.parse(localStorage.getItem("TimeStore") || "");
            set((state) => ({
              ...state,
              [target]: defaultTimer[target],
              ...storage.state,
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

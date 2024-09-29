import {
  AnimatePresence,
  motion,
  MotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback, useEffect, useState } from "react";
import { useTimerContext } from "@/context/TimerContextProvider";
import { formatTime } from "@/lib/utils";

import { Button } from "./ui/button";
import { Play, Pause, TimerReset } from "lucide-react";

interface TabButtonProps {
  id: string;
  selected: string;
  label: string;
  onClick: (id: string) => any;
}

const TabButton = ({ id, label, selected, onClick }: TabButtonProps) => (
  <TabsTrigger
    className="text-base font-semibold relative"
    value={id}
    onClick={() => onClick(id)} // Use handleTabSelection here
  >
    <span className="z-10">{label}</span>
    {selected === id && <Overlay />}
  </TabsTrigger>
);

// Constants for the digit display
const fontSize = 60; // Adjust for bigger numbers
const padding = 20;
const height = fontSize + padding;

interface TabContentProps {
  id: string;
  selected: string;
  content: number;
}

const TabContent = ({ id, selected, content }: TabContentProps) => {
  if (selected !== id) return null;

  const { countdown, startTimer, resetTimer, pauseTimer, running } =
    useTimer(content);
  const Icon = running ? Pause : Play;

  return (
    <TabsContent value={id} className="p-10 font-protest space-y-5">
      <AnimatePresence mode="popLayout">
        {selected === id && (
          <motion.div
            className="flex justify-center items-center"
            style={{
              width: "100%",
              height: "100%",
              transformOrigin: "center center",
            }}
            initial={{ opacity: 0, scale: 0.9 }} // Zoomed out initially
            animate={{
              opacity: 1,
              scale: 1,
              transition: { type: "tween", duration: 0.3 },
            }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
          >
            {/* Replace with the Counter */}
            <Counter value={countdown} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2">
        <Button
          className="w-full"
          onClick={() => (running ? pauseTimer() : startTimer())}
        >
          <Icon />
        </Button>
        <Button variant="destructive" onClick={resetTimer}>
          <TimerReset />
        </Button>
      </div>
    </TabsContent>
  );
};

function Counter({ value }: { value: number }) {
  const { hours, minutes, seconds } = formatTime(value); // Format the time
  return (
    <div
      style={{ fontSize }}
      className="flex space-x-3 overflow-hidden rounded bg-white px-2 leading-none text-gray-900"
    >
      {/* Hours */}
      <Digit place={1} value={parseInt(hours[0], 10)} />{" "}
      {/* Tens place of hours */}
      <Digit place={1} value={parseInt(hours[1], 10)} />{" "}
      {/* Ones place of hours */}
      {/* Colon */}
      <span>:</span>
      {/* Minutes */}
      <Digit place={1} value={parseInt(minutes[0], 10)} />{" "}
      {/* Tens place of minutes */}
      <Digit place={1} value={parseInt(minutes[1], 10)} />{" "}
      {/* Ones place of minutes */}
      {/* Colon */}
      <span>:</span>
      {/* Seconds */}
      <Digit place={1} value={parseInt(seconds[0], 10)} />{" "}
      {/* Tens place of seconds */}
      <Digit place={1} value={parseInt(seconds[1], 10)} />{" "}
      {/* Ones place of seconds */}
    </div>
  );
}

function Digit({ place, value }: { place: number; value: number }) {
  const valueRoundedToPlace = Math.floor((value / place) % 10); // Get the digit for this place (e.g., hundreds, tens, etc.)
  const animatedValue = useSpring(valueRoundedToPlace, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, value]);

  return (
    <div style={{ height }} className="relative w-[1ch] tabular-nums">
      {/* 
        For every digit we are placing 10 numbers.
        using relative and absolute , we are placing in vertical
        And we are scrolling
        and the container is having overflow hidden
      */}
      {[...Array(10).keys()].map((i) => (
        <Number key={i} mv={animatedValue} number={i} />
      ))}
    </div>
  );
}

function Number({ mv, number }: { mv: MotionValue; number: number }) {
  let y = useTransform(mv, (latest) => {
    let placeValue = latest % 10;
    let offset = (10 + number - placeValue) % 10;
    let memo = offset * height; // scrolling 

    if (offset > 5) {
      memo -= 10 * height;
    }

    return memo;
  });

  return (
    <motion.span
      style={{ y }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {number}
    </motion.span>
  );
}
const Overlay = () => (
  <motion.span
    layoutId="pill-tab"
    transition={{ type: "spring", duration: 0.5 }}
    className="absolute inset-0 z-0 rounded-md bg-background text-foreground shadow"
  />
);

export function Timer() {
  const { interval, breakTime } = useTimerContext();
  const tabData = [
    { id: "interval", label: "Interval", time: interval },
    { id: "break", label: "Break", time: breakTime },
  ];

  const [selected, setSelected] = useState(tabData[0].id);

  function handleTabSelection(id: string) {
    setSelected(id);
  }

  return (
    <Tabs defaultValue={tabData[0].id} className="w-[400px] m-6">
      <TabsList className="grid w-full grid-cols-2">
        {tabData.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            selected={selected}
            onClick={handleTabSelection} // Use handleTabSelection here
          />
        ))}
      </TabsList>
      {tabData.map((tab) => (
        <TabContent
          content={tab.time}
          key={tab.id}
          id={tab.id}
          selected={selected}
        />
      ))}
    </Tabs>
  );
}

function useTimer(initialTime: number) {
  const [time, setTime] = useState(initialTime);
  const [running, setRunning] = useState(false);

  const startTimer = useCallback(() => setRunning(true), []);
  const pauseTimer = useCallback(() => setRunning(false), []);
  const resetTimer = useCallback(() => {
    setRunning(false);
    setTime(time);
  }, [initialTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (running) {
      timer = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime > 0) return prevTime - 1;
          resetTimer();
          return 0;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [running]);

  return { countdown: time, startTimer, pauseTimer, resetTimer, running };
}

import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
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

interface TabContentProps {
  id: string;
  selected: string;
  content: number;
  previousTime: number;
}

const TabContent = ({
  id,
  selected,
  content,
  previousTime,
}: TabContentProps) => {
  const [play, setPlay] = useState(false);
  if (selected !== id) return;
  const Icon = play ? Pause : Play;

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
              scale: 1, // Zooms in on entry
              transition: {
                type: "tween",
                duration: 0.3, // Smooth entry
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.9, // Zooms out on exit
              transition: { duration: 0.3 }, // Shorter exit to avoid splash effect
            }}
          >
            <h4 className="text-8xl font-extrabold">{formatTime(content)}</h4>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex gap-2">
        <Button className="w-full" onClick={() => setPlay((p) => !p)}>
          <Icon />
        </Button>
        <Button variant="destructive">
          <TimerReset />
        </Button>
      </div>
    </TabsContent>
  );
};

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
  const [prevTabTime, setPrevTabTime] = useState(0);

  function handleTabSelection(id: string) {
    const prevTabId = selected;
    const prevTab = tabData.find((tab) => tab.id === prevTabId);
    if (prevTab) {
      setPrevTabTime(prevTab.time);
    }
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
          previousTime={prevTabTime}
        />
      ))}
    </Tabs>
  );
}

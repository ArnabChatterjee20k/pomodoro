import { Settings as Icon } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "./ui/slider";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Clock, Coffee, Bell } from "lucide-react";
import { useTimeStore } from "@/store/TimeStore";
import { Button } from "./ui/button";
import { enableWebNotifications } from "@/lib/utils";

export default function Settings() {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full max-w-[1500px] p-6 flex justify-end">
      <Dialog open={open}>
        <DialogTrigger onClick={() => setOpen(true)}>
          <Icon
            className="cursor-pointer hover:-rotate-180 transition-transform duration-300 ease-in-out"
            size={36}
          />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <WorkSessionTimer />
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WorkSessionTimer() {
  const [notifications, setNotifications] = useState(
    Notification.permission === "granted"
  );
  const { defaultBreakTime, defaultInterval, setter } = useTimeStore();

  useEffect(() => {
    setNotifications(Notification.permission === "granted");
  }, []);

  return (
    <div className="space-y-6 px-2 py-6">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <Label htmlFor="deep-work" className="text-sm font-medium">
            Deep work Session (minutes)
          </Label>
        </div>
        <div className="flex items-center space-x-4">
          <Slider
            id="deep-work"
            min={1}
            max={120} // max 120 minutes
            step={1}
            value={[defaultInterval / 60]}
            onValueChange={(value) => setter("defaultInterval", value[0] * 60)}
            className="flex-grow"
          />

          <Input
            type="number"
            value={defaultInterval / 60} // Display in minutes for input
            onChange={(e) => {
              const newValue = Number(e.target.value);
              setter("defaultInterval", newValue * 60); // Convert minutes back to seconds when setting
            }}
            className="w-16"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Coffee className="w-5 h-5" />
          <Label htmlFor="break-time" className="text-sm font-medium">
            Break Time (minutes)
          </Label>
        </div>
        <div className="flex items-center space-x-4">
          <Slider
            id="break-time"
            min={1}
            max={60}
            step={1}
            value={[defaultBreakTime / 60]}
            onValueChange={(value) => setter("defaultBreakTime", value[0] * 60)}
            className="flex-grow"
          />
          <Input
            type="number"
            value={defaultBreakTime / 60}
            onChange={(e) =>
              setter("defaultBreakTime", Number(e.target.value) * 60)
            }
            className="w-16"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="notifications"
          checked={notifications}
          onCheckedChange={() => {
            enableWebNotifications();
          }}
        />
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          <Label htmlFor="notifications" className="text-sm font-medium">
            Turn on browser notifications
          </Label>
        </div>
      </div>
    </div>
  );
}

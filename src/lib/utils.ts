import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const remainingSecondsAfterHours = seconds % 3600;
  const minutes = Math.floor(remainingSecondsAfterHours / 60);
  const remainingSeconds = remainingSecondsAfterHours % 60;

  return {
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: remainingSeconds.toString().padStart(2, "0"),
  };
}

export function enableWebNotifications() {
  if (!("Notification" in window)) {
    console.error("This browser does not support desktop notifications.");
    return;
  }

  if (Notification.permission === "granted") {
    showNotification("Hello! Notifications are already enabled.");
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        showNotification("Web Notifications enabled successfully!");
      } else {
        console.log("User denied notification permission.");
      }
    });
  }
}
function showNotification(message) {
  const notification = new Notification("Notification", {
    body: message,
  });

  notification.onclick = () => {
    window.focus(); // Bring the window to the front
  };
}

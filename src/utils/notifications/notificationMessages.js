import { sendNotification } from "@tauri-apps/plugin-notification";

const notificationMessages = [
  "Great job! Time to take a short break",
  "Pomodoro complete! Stretch your legs",
  "You crushed it! Grab a coffee",
  "Time's up! Breathe and relax",
  "Well done! Let your mind recharge",
  "Another Pomodoro down! Keep it up",
  "Break time! You've earned it",
  "Productivity unlocked! Take 5",
  "High five! Your focus rocks!",
  "Time to rest your brain"
];

export const showNotification = () => {
  const randomIndex = Math.floor(Math.random() * notificationMessages.length);

  sendNotification({
    title: "Pomodoro Completed 🎉",
    body: notificationMessages[randomIndex],
  });
};

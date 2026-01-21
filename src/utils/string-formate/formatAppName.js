
const appMap = {
  // 🧠 Dev tools
  "devenv.exe": "Visual Studio",
  "code.exe": "VS Code",
  "code-insiders.exe": "VS Code Insiders",
  "idea64.exe": "IntelliJ IDEA",
  "pycharm64.exe": "PyCharm",
  "webstorm64.exe": "WebStorm",
  "androidstudio64.exe": "Android Studio",
  "studio64.exe": "Android Studio",
  "eclipse.exe": "Eclipse IDE",
  "sublime_text.exe": "Sublime Text",
  "notepad++.exe": "Notepad++",
  "gitkraken.exe": "GitKraken",
  "githubdesktop.exe": "GitHub Desktop",
  "postman.exe": "Postman",
  "pgadmin4.exe": "pgAdmin 4",
  "docker desktop.exe": "Docker Desktop",
  "dockerdesktop.exe": "Docker Desktop",
  "powershell.exe": "PowerShell",
  "pwsh.exe": "PowerShell",
  "cmd.exe": "Command Prompt",
  "windowsterminal.exe": "Windows Terminal",

  // 🌐 Browsers
  "chrome.exe": "Google Chrome",
  "msedge.exe": "Microsoft Edge",
  "firefox.exe": "Firefox",
  "brave.exe": "Brave Browser",
  "opera.exe": "Opera",

  // 🖥️ Windows apps
  "explorer.exe": "File Explorer",
  "taskmgr.exe": "Task Manager",
  "control.exe": "Control Panel",
  "settings.exe": "Settings",
  "notepad.exe": "Notepad",
  "calc.exe": "Calculator",
  "mspaint.exe": "Paint",
  "photos.exe": "Photos",

  // 🧑‍💻 Communication
  "slack.exe": "Slack",
  "discord.exe": "Discord",
  "teams.exe": "Microsoft Teams",
  "zoom.exe": "Zoom",

  // 🧘 Your app
  "app.exe": "Dev Wellbeing",
};


export function formatAppName(rawPath) {
  if (!rawPath) return "";

  const parts = rawPath.split(/[/\\]/);
  const rawName = parts[parts.length - 1];
  const exeName = rawName.toLowerCase();

  if (appMap[exeName]) {
    return appMap[exeName];
  }

  // Fallback formatting
  let cleaned = rawName.replace(/\.exe$/i, "");

  cleaned = cleaned.replace(/([a-zA-Z])(\d)/g, "$1 $2");
  cleaned = cleaned.replace(/([a-z])([A-Z])/g, "$1 $2");

  cleaned = cleaned
    .split(/[\s-_]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return cleaned;
}

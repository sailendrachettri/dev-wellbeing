export const getAppIcon = (appName) => {
  const icons = {
    // Browsers
    chrome: "🌐",
    firefox: "🦊",
    edge: "🌊",
    safari: "🧭",
    brave: "🦁",
    opera: "⭕",
    
    // Code Editors & IDEs
    vscode: "💻",
    "visual studio": "💜",
    visualstudio: "💜",
    atom: "⚛️",
    sublime: "📝",
    notepad: "📄",
    pycharm: "🐍",
    intellij: "💡",
    webstorm: "🌪️",
    eclipse: "🌘",
    vim: "⌨️",
    emacs: "⌨️",
    
    // Communication
    slack: "💬",
    discord: "💬",
    teams: "👥",
    zoom: "📹",
    skype: "📞",
    telegram: "✈️",
    whatsapp: "💚",
    messenger: "💬",
    signal: "🔒",
    
    // Media & Entertainment
    spotify: "🎵",
    itunes: "🎵",
    vlc: "🎬",
    netflix: "🎬",
    youtube: "▶️",
    obs: "🎥",
    audacity: "🎙️",
    
    // Design & Creative
    figma: "🎨",
    photoshop: "🖼️",
    illustrator: "✏️",
    aftereffects: "🎬",
    premierepro: "🎞️",
    blender: "🎭",
    gimp: "🖌️",
    canva: "🎨",
    sketch: "💎",
    xd: "🎨",
    
    // Productivity
    notion: "📓",
    obsidian: "🧠",
    onenote: "📔",
    evernote: "🐘",
    trello: "📋",
    asana: "✅",
    jira: "📊",
    
    // Office Suite
    word: "📝",
    excel: "📊",
    powerpoint: "📽️",
    outlook: "📧",
    gmail: "✉️",
    sheets: "📊",
    docs: "📄",
    
    // Development Tools
    github: "🐙",
    git: "🔀",
    docker: "🐳",
    postman: "📮",
    insomnia: "😴",
    terminal: "⚡",
    powershell: "🔷",
    cmd: "⬛",
    iterm: "💻",
    hyper: "⚡",
    
    // File Management
    explorer: "📁",
    finder: "🔍",
    dropbox: "📦",
    drive: "☁️",
    onedrive: "☁️",
    
    // Gaming
    steam: "🎮",
    epic: "🎮",
    origin: "🎮",
    battlenet: "⚔️",
    minecraft: "⛏️",
    roblox: "🎮",
    
    // System & Utilities
    taskmgr: "📊",
    settings: "⚙️",
    control: "🎛️",
    calculator: "🔢",
    calendar: "📅",
    
    // Database & Data
    mysql: "🗄️",
    mongodb: "🍃",
    postgres: "🐘",
    redis: "🔴",
    sqlite: "💾",
    
    // Other Tools
    unity: "🎯",
    unreal: "🎮",
    godot: "🤖",
    anaconda: "🐍",
    jupyter: "📊",
    rstudio: "📈",
  };
  
  const key = appName
    .toLowerCase()
    .replace(/\.exe$/i, "")
    .replace(/\s+/g, "");
  
  return icons[key] || "🖥️";
};
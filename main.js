const { app, BrowserWindow, Menu, Tray, screen, globalShortcut, autoUpdater } = require('electron');
const path = require('path');
const fs = require('fs');
const AutoLaunch = require('auto-launch');

const CONFIG_FILE = path.join(app.getPath('userData'), 'widget.config.json');
const TOGGLE_SHORTCUT = 'Ctrl+Shift+W'; // Custom shortcut to toggle the widget

let mainWindow;
let tray = null;
let widgetConfig = {
  x: null,
  y: null,
  width: 800,
  height: 600
};

const autoLauncher = new AutoLaunch({
  name: 'F1 Widget',
  path: app.getPath('exe'),
});

autoLauncher.isEnabled().then((isEnabled) => {
  if (!isEnabled) autoLauncher.enable();
});

function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  loadConfig(); // Load the config before creating the window

  // If the configuration file is not present or doesn't have x/y, place the window in the top-right corner
  if (widgetConfig.x === null || widgetConfig.y === null) {
    widgetConfig.x = screenWidth - widgetConfig.width;
    widgetConfig.y = 0; // Top-right corner
  }

  mainWindow = new BrowserWindow({
    width: widgetConfig.width,
    height: widgetConfig.height,
    x: widgetConfig.x,
    y: widgetConfig.y,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  tray = new Tray(path.join(__dirname, 'icon.png'));
  const trayMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click() {
        mainWindow.show();
      }
    },
    {
      label: 'Hide',
      click() {
        mainWindow.hide();
      }
    },
    {
      label: 'Exit',
      click() {
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(trayMenu);
  tray.setToolTip('Event Card');
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('close', () => {
    const bounds = mainWindow.getBounds();
    widgetConfig.x = bounds.x;
    widgetConfig.y = bounds.y;
    widgetConfig.width = bounds.width;
    widgetConfig.height = bounds.height;
    saveConfig();
  });

  // Register a global shortcut for Ctrl+Shift+W
  globalShortcut.register(TOGGLE_SHORTCUT, () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      widgetConfig = JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading config:', err);
  }
}

function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(widgetConfig));
  } catch (err) {
    console.error('Error saving config:', err);
  }
}

app.on('ready', () => {
  createWindow();
  // Show the main window initially
  mainWindow.show();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

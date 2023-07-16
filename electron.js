const {app, BrowserWindow} = require('electron');
const path = require('path');
const {spawn} = require('child_process');
const waitOn = require('wait-on');
const killTree = require('tree-kill');

const serverURL = 'http://localhost:3000';

let mainWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    icon: path.join(__dirname, 'assets/icons/icon.icns'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  console.info(`Set icon...`);
  const dockIcon = path.join(__dirname, 'assets/icons/icon.icns');
  app.dock.setIcon(dockIcon);

  // Start the main window.
  console.info(`Start main window...`);
  await mainWindow.loadURL(serverURL);

  // Quit the app when the main window is closed.
  mainWindow.on('closed', () => {
    console.info(`closed)`);
    app.quit();
  });
}

// Store process ID of the Next.js server.
let nextServerProcess;

app.whenReady().then(async () => {
  // Start the Next.js server as a child process
  console.info(`TomTom ChatBot UI - Electron ${process.versions.electron}`);
  console.info('Starting Next.js server (using npm)...');

  const envWithCustomPaths = {
    ...process.env,
    PATH: process.env.PATH + ':/usr/local/bin:/opt/homebrew/bin'
  };
  const nextServerProcess = spawn('npm', ['run', 'start'], {env: envWithCustomPaths, shell: true});

  nextServerProcess.stdout.on('data', (data) => {
    console.log(`${data.toString().replace(/\n$/, '')}`);
  });

  nextServerProcess.stderr.on('data', (data) => {
    console.error(`${data.toString().replace(/\n$/, '')}`);
  });

  nextServerProcess.on('exit', (code) => {
    console.info(`Child ${nextServerProcess.pid} exited with code ${code}`);
  });

  // Wait until the Next.js server is ready
  console.info(`Wait for Next.js server at ${serverURL}...}`);
  try {
    await waitOn({resources: [serverURL], timeout: 30000});
  } catch (error) {
    console.error(`Next.js server not available at ${serverURL}:`, error);
    app.quit();
    return;
  }
  console.info(`Next.js server is available at ${serverURL}`);

  // Start the main window
  createWindow();
});

app.on('activate', () => {
  console.info(`activate`);
  if (BrowserWindow.getAllWindows().length === 0) {
    console.info(`create window`);
    createWindow();
  } else if (mainWindow) {
    console.info(`regain focus`);
    mainWindow.show();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  console.info(`window-all-closed`);
  app.quit();
});

app.on('before-quit', () => {
  console.info(`before-quit`);
  if (nextServerProcess) {
    console.info(`kill next process (${nextServerProcess.pid}, and children)`);
    killTree(nextServerProcess.pid, 'SIGTERM', (error) => {
      if (error) {
        console.error(`Failed to kill Next.js server process ${nextServerProcess.pid}:`, error);
      }
    });
    nextServerProcess = null;
  }
});
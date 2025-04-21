const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const QRCode = require('qrcode');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        minWidth: 375,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true // Включение поддержки webview
        },
        autoHideMenuBar: true,
        frame: false
    });

    mainWindow.loadFile('index.html');
    // ipcMain.on('request-history', (event) => {
    // });
    // mainWindow.webContents.openDevTools();
    // mainWindow.setFullScreen(false);
}

app.on('ready', createWindow);

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

ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.on('close-window', () => {
    mainWindow.close();
});

ipcMain.handle('generate-qrcode', async (event, text) => {
    try {
        const options = { width: 300 };
        const url = await QRCode.toDataURL(text, options);
        return { success: true, url };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

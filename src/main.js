const electron = require('electron');
const {app} = electron;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        'width': 960,
        'height': 600,
        'minWidth': 1366,
        'minHeight': 600,
        'show': false
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', function () {
        mainWindow = null
    });

    mainWindow.setMenu(null);

    if (process.env.DEBUG)
        mainWindow.webContents.openDevTools();
}

app.on('ready', () => {
    createWindow();
    require('./functions');
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});
const { app, Menu, Tray } = require('electron');
const path = require('path');

const unhandled = require('electron-unhandled');
unhandled();

const prefs = require('./prefs');

const mpvClient = require('./mpvClient');

const assetsPath = path.join(__dirname, 'assets');

const haRequest = require('./ha-request');

let tray;
const trayIcon = path.join(assetsPath, 'projector-light_@2x.png');
const createTray = () => {
    tray = new Tray(trayIcon);
};

const toggleLights = async () => {
    const state = await haRequest.getLightsState();

    if (state === 'on') {
        haRequest.turnLights('off').then(() => updateToggleLightsItem('off'));
    }
    else {
        haRequest.turnLights('on').then(() => updateToggleLightsItem('on'));
    }
}

const mpvMenuItem = { label: 'mpv is not Connected', type: 'normal', enabled: false };
const toggleLightsItem = { label: 'Turn Lights On', type: 'checkbox', checked: false, click: toggleLights };
const prefsMenuItem = { label: 'Preferences', type: 'normal', click: prefs.createWindow };
const quitMenuItem = { label: 'Quit', type: 'normal', click: () => app.quit() };

// remove deprecation warning
app.allowRendererProcessReuse = true;

// Don't show the app in the doc
app.dock.hide();
app.on('ready', async () => {
    createTray();

    updateMpvStatus();

    updateToggleLightsItem('');
});

// keep the app running with no windows open
app.on('window-all-closed', e => e.preventDefault());

let mpvIsConnected = false;
const updateMpvStatus = async () => {
    while (true) {
        const isConnected = mpvClient.isConnected();
        if (mpvIsConnected !== isConnected) {
            mpvIsConnected = isConnected;
            updateTrayIcon(isConnected);
            updateMpvMenuItem(isConnected);
        }

        await sleep(1000);
    }
}

const updateTrayIcon = (isConnected) => {
    trayIconIsOn = mpvIsConnected;
    const trayImage = isConnected ? path.join(assetsPath, 'projector-light-on_@2x.png') : path.join(assetsPath, 'projector-light_@2x.png');
    tray.setImage(trayImage);
};

const updateMpvMenuItem = (isConnected) => {
    mpvMenuItem.label = isConnected ? 'mpv is Connected' : 'mpv is not Connected';
    mpvMenuItem.enabled = isConnected;
    updateContextMenu();
}

const updateToggleLightsItem = async (state) => {
    if (!state) {
        state = await haRequest.getLightsState();
    }

    toggleLightsItem.label = (state === 'on') ? "Lights: On" : "Turn Lights On";
    toggleLightsItem.checked = (state === 'on');
    updateContextMenu();
}

const updateContextMenu = () => {
    const contextMenu = Menu.buildFromTemplate([
        mpvMenuItem,
        toggleLightsItem,
        prefsMenuItem,
        quitMenuItem
    ]);

    tray.setContextMenu(contextMenu);
}

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
const { app, ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const keytar = require('keytar');

const openAtLoginPath = path.join(app.getPath('userData'), 'openAtLogin');

ipcMain.on('getUserData', async (event, data) => {
    const userData = {
        haHost: await getPassword('haHost'),
        haPort: await getPassword('haPort'),
        haAuthToken: await getPassword('haAuthToken'),
        openAtLogin: getOpenAtLogin()
    };

    event.sender.send('userDataReceived', userData);
});

const getPassword = async (account) => {
    return await keytar.getPassword('ctroll.io', account);
};

const setPassword = (account, secret) => {
    keytar.setPassword('ctroll.io', account, secret);
};

const deletePassword = (account) => {
    keytar.deletePassword('ctroll.io', account);
};

const getOpenAtLogin = () => {
    return fs.existsSync(openAtLoginPath);
};

const createWindow = () => {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 320,
        height: 320,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    win.loadFile(path.join(__dirname, 'prefs.html'));

    // Open the DevTools.
    // win.webContents.openDevTools();
};

ipcMain.on('setAccountData', (event, data) => {
    if (data.secret) {
        setPassword(data.account, data.secret);
    }
    else {
        deletePassword(data.account);
    }
});

ipcMain.on('setLoginItemSetting', (event, data) => {
    app.setLoginItemSettings({
        openAtLogin: data,
        openAsHidden: true
    });

    if (data) {
        fs.writeFileSync(openAtLoginPath, '');
    }
    else {
        fs.unlinkSync(openAtLoginPath);
    }
});

module.exports = {
    createWindow: createWindow,
    getPassword: getPassword
}
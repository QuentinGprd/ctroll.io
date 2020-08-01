const ipc = require('electron').ipcRenderer;

const haHostInput = document.getElementById("haHost");
const haPortInput = document.getElementById("haPort");
const haAuthTokenInput = document.getElementById("haAuthToken");
const openAtLoginCheckbox = document.getElementById("openAtLogin");

document.addEventListener("DOMContentLoaded", () => {
    ipc.once('userDataReceived', (event, response) => {
        haHostInput.value = response.haHost ? response.haHost : '';
        haPortInput.value = response.haPort ? response.haPort : '';
        haAuthTokenInput.value = response.haAuthToken ? response.haAuthToken : '';
        openAtLoginCheckbox.checked = response.openAtLogin ? true : false;
    });

    ipc.send('getUserData');
});

haHostInput.addEventListener('change', (event) => {
    ipc.send('setAccountData', {
        account: 'haHost',
        secret: event.target.value
    });
});

haPortInput.addEventListener('change', (event) => {
    ipc.send('setAccountData', {
        account: 'haPort',
        secret: event.target.value
    });
});

haAuthTokenInput.addEventListener('change', (event) => {
    ipc.send('setAccountData', {
        account: 'haAuthToken',
        secret: event.target.value
    });
});

openAtLoginCheckbox.addEventListener('change', (event) => {
    ipc.send('setLoginItemSetting', event.target.checked);
});
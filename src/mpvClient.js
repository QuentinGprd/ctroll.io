const haRequest = require('./ha-request');
const net = require('net');

let _client;
let _isConnected = false;

const isConnected = () => {
    if (_client) {
        return _isConnected;
    }
    else {
        createClient({
            path: '/tmp/mpvsocket'
        });

        return _isConnected;
    }
}

const createClient = (options) => {
    _client = net.connect(options);

    _client.on('connect', () => {
        console.log('mpv client connected');
        _isConnected = true;
    });

    _client.on('data', function (data) {
        try {
            // Prevent a bug where the same data is received on several lines
            const eventData = data.toString('utf8').split('\n', 1)[0];
            const json = JSON.parse(eventData);
            sendEventToHa(json.event);
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                return;
            }

            throw error;
        }
    });

    _client.on('error', (error) => {
        if (error.code === 'ECONNREFUSED') {
            return;
        }

        throw error;
    });

    _client.on('close', () => {
        if (_isConnected) {
            console.log('mpv client connection closed.');
            _isConnected = false;
            haRequest.turnLights('on');
        }

        _client = null;
    });
};

const sendEventToHa = (event) => {
    console.log('Send mpv event to HA', event);
    switch (event) {
        case "pause":
            haRequest.turnLights('on');
            break;

        case "unpause":
            haRequest.turnLights('off');
            break;

        default:
            console.log("Unsupported event", event);
            break;
    }
};

module.exports = {
    isConnected: isConnected
}
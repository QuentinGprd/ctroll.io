const https = require('https');
const userPrefs = require('./prefs');

let requestInProgress = false;

const getHomeAssistantParams = async () => {
    const haHost = await userPrefs.getPassword("haHost");
    if (!haHost) {
        throw new Error('HA Host is missing.');
    }

    const haPort = await userPrefs.getPassword("haPort");
    if (!haPort) {
        throw new Error('HA Port is missing.');
    }

    const haAuthToken = await userPrefs.getPassword("haAuthToken");
    if (!haAuthToken) {
        throw new Error('HA Auth Token is missing.');
    }

    return {
        host: haHost,
        port: haPort,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + haAuthToken
        }
    };
};

const get = (path) => new Promise(async (resolve, reject) => {

    const homeAssistantParams = await getHomeAssistantParams();

    const options = {
        ...homeAssistantParams,
        method: 'GET',
        path
    };

    const req = https.get(options, (res) => {

        res.on('data', (d) => {
            resolve(d);
        });
    });

    req.on('error', (error) => {
        console.error(error);
        reject(error);
    });
});

const post = (path) => new Promise(async (resolve, reject) => {
    const homeAssistantParams = await getHomeAssistantParams();

    const options = {
        ...homeAssistantParams,
        method: 'POST',
        path
    };

    const req = https.request(options, (res) => {
        console.log('statusCode:', res.statusCode);
        if (res.statusCode === 200 || res.statusCode === 201) {
            resolve();
        }
        else {
            reject();
        }
    });

    req.on('error', (error) => {
        console.error(error);
        reject(error);
    });


    req.write("{}");
    req.end();
});

const getLightsState = async () => {
    const request = await get("/api/states/light.0xccccccfffed45ffc_light");
    const light = JSON.parse(request);
    return light.state;
};

const turnLights = async (value) => {

    if (requestInProgress) {
        return;
    }

    requestInProgress = true;

    await post("/api/webhook/turn_living_room_lights_" + value)
        .then(() => {
            console.log("Lights are " + value);
        })
        .finally(() => {
            requestInProgress = false;
        });
};

module.exports = {
    getLightsState: getLightsState,
    turnLights: turnLights
}
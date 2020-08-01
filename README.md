# ctroll.io

Cross-platform desktop app to interact with the Home Assistant Rest API.

## using [mpv](https://github.com/mpv-player/mpv)
Trigger automations based on mpv events.

**with [IINA](https://github.com/iina/iina):**

- [x] Enable advanced settings

- Additional mpv options:
	```json
	{
		"input-ipc-server":  "/tmp/mpvsocket"
	}
	```

## Run

> yarn start

## Build

Add target platforms in `package.json`:
```json
{
  "config": {
    "forge": {
      "makers": [
        {
          "name": "@electron-forge/maker-zip",
          "platforms": [
			"darwin",
			"linux"
          ]
        },
      ]
    }
  },
}
```

Then use:
> yarn make
# MMM-TautulliActivity

[Tautulli](https://tautulli.com) current watch activity module for [MagicMirror2](https://magicmirror.builders).

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub last commit](https://img.shields.io/github/last-commit/derekn/MMM-TautulliActivity/master.svg)](https://github.com/derekn/MMM-TautulliActivity/commits/master)

Displays the currently playing [Plex](https://www.plex.tv) stream activity on your MagicMirror pulled from the Tautulli API.

### Install

Clone into your MM `modules` folder

```bash
git clone git@github.com:derekn/MMM-TautulliActivity.git
```

### Configure

Add to "modules" in `config/config.js`

```javascript
{
	module: "MMM-TautulliActivity",
	header: "Tautulli Activity",
	position: "bottom_left",
	config: {
		host: "https://tautulli_ip:port",
		apiKey: "tautulli_api_key",
		updateFrequency: 2,
	}
}
```

#### Options

| Config Name | Description | Default Value |
| --- | --- | --- |
| `host` | Tautulli hostname/ip address, example: http://localhost:8181 | **required** |
| `apiKey` | Tautulli API key, found in Settings / Web Interface, at the bottom | **required** |
| `updateFrequency` | Update frequency in minutes to poll the API for activity | 2 |
| `animationSpeed` | Animation speed in milliseconds for display updates, set to 0 for none | 500 |

/**
 * MMM-TautulliActivity node helper
 */

const NodeHelper = require('node_helper');
const fetch = require('node-fetch');

module.exports = NodeHelper.create({
	config: null,
	data: null,
	reloadTimer: null,

	getData: function() {
		console.info('MMM-TautulliActivity: fetching data');
		fetch(`${this.config.host}/api/v2?apikey=${this.config.apiKey}&cmd=get_activity`)
			.then((res) => {
				if (res.ok) {
					return res;
				} else {
					throw res.statusText;
				}
			})
			.then((res) => res.json())
			.then((data) => {
				if (data.response.result != 'success') {
					throw data.response.message || 'there was an error';
				}
				this.data = data.response.data;
				this.sendSocketNotification('SET_DATA', this.data);
			})
			.catch((err) => {
				console.error('MMM-TautulliActivity: ' + err)
				this.sendSocketNotification('SET_DATA', err);
			})
			.finally(() => {
				this.reloadTimer = setTimeout(() => { this.getData(this.config) }, this.config.updateFrequency);
			});
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification == 'INIT') {
			if (! this.reloadTimer) {
				console.info('MMM-TautulliActivity: starting reload timer');
				this.config = payload;
				this.getData();
			} else {
				this.sendSocketNotification('SET_DATA', this.data);
			}
		}
	},
});

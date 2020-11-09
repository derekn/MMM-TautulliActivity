/**
 * MMM-TautulliActivity node helper
 */

const NodeHelper = require('node_helper');
const request = require('request');

module.exports = NodeHelper.create({
	config: null,
	data: null,
	reloadTimer: null,

	getData: function() {
		console.info('MMM-TautulliActivity: fetching data');
		var req = request.defaults({'agentOptions': {'rejectUnauthorized': false}});
		req.get(`${this.config.host}/api/v2?apikey=${this.config.apiKey}&cmd=get_activity`, (err, res, body) => {
			var data = JSON.parse(body);

			if (err || res.statusCode != 200) {
				data = data.response.message || 'there was an error';
				console.error('MMM-TautulliActivity: ' + data);
			} else {
				data = data.response.data;
			}

			this.data = data;
			this.sendSocketNotification('SET_DATA', this.data);
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

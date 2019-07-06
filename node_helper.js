/**
 * MMM-TautulliActivity node helper
 */

var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
	getData: function(config) {
		req = request.defaults({'agentOptions': {'rejectUnauthorized': false}});
		req.get(`${config.host}/api/v2?apikey=${config.apiKey}&cmd=get_activity`, (err, res, body) => {
			var data = JSON.parse(body);

			if (err || res.statusCode != 200) {
				data = data.response.message || 'there was an error';
				console.error('MMM-TautulliActivity: ' + data);
			} else {
				data = data.response.data;
			}

			this.sendSocketNotification('SET_DATA', data);
			setTimeout(() => { this.getData(config) }, config.updateFrequency);
		});
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification == 'GET_DATA') {
			this.getData(payload);
		}
	},
});

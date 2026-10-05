/**
 * MMM-TautulliActivity node helper
 */

const NodeHelper = require('node_helper')
const Log = require('logger')

// One poller shared by all clients
module.exports = NodeHelper.create({
	async getData() {
		Log.info(`${this.name}: fetching data`)
		try {
			const url = new URL('api/v2', `${this.config.host}/`)
			url.search = new URLSearchParams({ apikey: this.config.apiKey, cmd: 'get_activity' })
			const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			const { response } = await res.json()
			if (response?.result !== 'success') throw new Error(response?.message || 'there was an error')
			this.data = response.data
		} catch (err) {
			Log.error(`${this.name}: ${err.message}`)
			this.data = { error: err.message }
		}
		this.sendSocketNotification('SET_DATA', this.data)
		setTimeout(() => this.getData(), this.config.updateFrequency)
	},

	socketNotificationReceived(notification, config) {
		if (notification !== 'INIT') return
		if (!this.config) {
			Log.info(`${this.name}: starting reload timer`)
			this.config = config
			this.getData()
		} else if (this.data) {
			this.sendSocketNotification('SET_DATA', this.data)
		}
	},
})

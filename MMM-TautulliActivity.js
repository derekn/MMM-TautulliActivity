/**
 * MMM-TautulliActivity
 * Tautulli watch activity module for MagicMirror2.
 *
 * @author Derek Nicol <1420397+derekn@users.noreply.github.com>
 * @license https://opensource.org/licenses/MIT
 */

Module.register('MMM-TautulliActivity', {
	requiresVersion: '2.25.0',
	defaults: {
		host: '',
		apiKey: '',
		updateFrequency: 2,
		hideOnNoActivity: false,
		animationSpeed: 500,
		stateIcons: {
			playing: 'fa-regular fa-circle-play',
			paused: 'fa-regular fa-circle-pause',
			buffering: 'fa-solid fa-rotate',
		},
	},

	getStyles() {
		return ['MMM-TautulliActivity.css']
	},

	start() {
		Log.info(`Starting module: ${this.name}`)

		this.config.host = this.config.host.trim().replace(/\/$/, '')
		this.config.updateFrequency = this.config.updateFrequency * 60 * 1000

		this.sendSocketNotification('INIT', this.config)
	},

	getDom() {
		const wrapper = document.createElement('div')
		wrapper.className = 'small'
		const { sessions, error } = this.activityData ?? {}

		if (error) {
			wrapper.classList.add('error')
			wrapper.textContent = error
		} else if (!sessions) {
			wrapper.innerHTML = `<span class="loading dimmed">${this.translate('LOADING')}</span>`
		} else if (!sessions.length) {
			if (this.config.hideOnNoActivity && !this.hidden) {
				this.hide()
			}
			wrapper.innerHTML = '<span class="no-activity dimmed">nothing is currently playing</span>'
		} else {
			for (const row of sessions) {
				const item = wrapper.appendChild(document.createElement('div'))
				item.className = `activity-row ${row.state}`
				item.dataset.userId = row.user_id
				item.innerHTML = `
					<div class="activity">
						<i class="state-icon bright"></i> <span class="user-name bright"></span> <span class="title no-wrap"></span> <span class="title-year dimmed"></span>
					</div>
					<div class="details xsmall">
						<span class="duration"></span> <span class="quality"></span> <span class="transcode"></span>
					</div>`
				const set = (selector, text) => {
					item.querySelector(selector).textContent = text
				}
				item
					.querySelector('.state-icon')
					.classList.add(...(this.config.stateIcons[row.state] ?? 'fa-regular fa-circle').trim().split(/\s+/))
				set('.user-name', row.friendly_name)
				set('.title', row.full_title)
				set('.title-year', `(${row.year})`)
				set('.duration', `${this.convertMS(row.view_offset)} / -${this.convertMS(row.duration - row.view_offset)}`)
				set('.quality', row.quality_profile)
				set('.transcode', row.transcode_decision)
			}
			if (this.hidden) {
				this.show()
			}
		}

		return wrapper
	},

	socketNotificationReceived(notification, payload) {
		if (notification === 'SET_DATA') {
			this.activityData = payload
			this.updateDom(this.config.animationSpeed)
		}
	},

	convertMS(milliseconds) {
		const seconds = Math.floor((milliseconds / 1000) % 60)
		const minutes = Math.floor((milliseconds / (1000 * 60)) % 60)
		const hours = Math.floor(milliseconds / (1000 * 60 * 60))

		return [hours, minutes, seconds]
			.slice(hours ? 0 : 1)
			.map((n) => String(n).padStart(2, '0'))
			.join(':')
	},
})

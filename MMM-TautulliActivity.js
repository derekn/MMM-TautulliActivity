/**
 * MMM-TautulliActivity
 * Tautulli watch activity module for MagicMirror2.
 *
 * @author Derek Nicol <1420397+derekn@users.noreply.github.com>
 * @license https://opensource.org/licenses/MIT
 */

Module.register('MMM-TautulliActivity', {
	defaults: {
		host: '',
		apiKey: '',
		updateFrequency: 2,
		hideOnNoActivity: false,
		animationSpeed: 500,
		stateIcons: {
			'playing': 'far fa-play-circle',
			'paused': 'far fa-pause-circle',
			'buffering': 'far fa-sync-alt',
		},
	},
	activityData: null,

	getStyles: function() {
		return [
			'MMM-TautulliActivity.css',
		]
	},

	start: function() {
		Log.info(`Starting module: ${this.name}`);

		this.config.host = this.config.host.trim().replace(/\/$/, '')
		this.config.updateFrequency = this.config.updateFrequency * 60 * 1000;

		this.sendSocketNotification('INIT', this.config);
	},

	getDom: function() {
		var wrapper = document.createElement('div');
		wrapper.className = 'small';

		if (! this.activityData) {
			wrapper.innerHTML = '<span class="loading dimmed">loading&hellip;</span>';
		} else if (typeof this.activityData === 'string') {
			wrapper.innerHTML = `<span class="error">${this.activityData}</span>`;
		} else if (! this.activityData.sessions.length) {
			if (this.config.hideOnNoActivity && ! this.hidden) {
				this.hide();
			}
			wrapper.innerHTML = '<span class="no-activity dimmed">nothing is currently playing</span>';
		} else {
			for (const row of this.activityData.sessions) {
				wrapper.innerHTML += `
					<div class="activity-row ${row.state}" data-user-id="${row.user_id}">
						<div class="activity">
							<i class="state-icon bright ${this.config.stateIcons[row.state || 'far circle']}"></i> <span class="user-name bright">${row.friendly_name}</span> <span class="title no-wrap">${row.full_title}</span> <span class="title-year dimmed">(${row.year})</span>
						</div>
						<div class="details xsmall">
							<span class="duration">${this.convertMS(row.view_offset)} / -${this.convertMS(row.duration - row.view_offset)}</span> <span class="quality">${row.quality_profile}</span> <span class="transcode">${row.transcode_decision}</span>
						</div>
					</div>`;
			}
			if (this.hidden) {
				this.show()
			}
		}

		return wrapper;
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification == 'SET_DATA') {
			this.activityData = payload;
			this.updateDom(this.config.animationSpeed);
		}
	},

	convertMS: function(milliseconds) {
		var seconds = Math.floor((milliseconds / 1000) % 60);
		var minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
		var hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 60);

		if (hours) {
			return `${String(hours).padStart(2, 0)}:${String(minutes).padStart(2, 0)}:${String(seconds).padStart(2, 0)}`;
		} else {
			return `${String(minutes).padStart(2, 0)}:${String(seconds).padStart(2, 0)}`;
		}
	},
});

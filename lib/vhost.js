const {
	URL
} = require('url');

module.exports = class vhost {

	constructor(config) {
		this.config = config;
		this.modules = [];
		if (typeof this.config.vhost === 'string') {
			this.compare = new URL({
				toString: () => this.config.vhost
			})
		} else if (typeof this.config === 'object') {
			this.compare = new URL(this.config.vhost.pathname, `${this.config.vhost.protocol}://${this.config.vhost.domain}:${this.config.vhost.port}`)
		}
		this.initializeModules();
	}

	match(current) {
		return (current.href.indexOf(this.compare.href) > -1 ? true : false);
	}

	target() {
		return this.config.target;
	}

	executeModules(req, res) {

	}

	initializeModules() {
		if (this.config.modules) {
			for (var x = 0; x < this.config.modules.length; x++) {
				this.modules.push(
					require(this.config.modules[x].name)(
					//require('../../../hardbox-session-passport')(
						this.config.modules[x].config
					)
				)
			}
		}
	}

	executeModules(req, res, next) {
		if(this.modules.length) {
			for (var x = 0; x < this.modules.length; x++) {
				this.modules[x](req, res, next);
			}
		} else {
			next(null, req, res);
		}
	}
}

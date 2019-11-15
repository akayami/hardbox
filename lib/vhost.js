const {
	URL
} = require('url');

const path = require('path');
const express = require('express');

module.exports = class vhost {

	constructor(config, globalPath) {
		this.app = express();
		this.globalPath = globalPath;
		this.config = config;
		this.modules = [];
		if (typeof this.config.vhost === 'string') {
			this.compare = new URL({
				toString: () => this.config.vhost
			});
		} else if (typeof this.config === 'object') {
			this.compare = new URL(this.config.vhost.pathname, `${this.config.vhost.protocol}://${this.config.vhost.domain}:${this.config.vhost.port}`);
		}
		this.initializeModules();
	}

	match(current) {
		return current.href.indexOf(this.compare.href) > -1;
	}

	target() {
		return this.config.target;
	}

	initializeModules() {
		if (this.config.modules) {
			for (let x = 0; x < this.config.modules.length; x++) {
				let module;
				try {
					console.debug('Loading module: ' + this.config.modules[x].name);
					module = require(this.config.modules[x].name)(
						this.app,
						this.config.modules[x].config
					);
					console.debug('Loaded module: ' + this.config.modules[x].name);
				} catch(e) {
					try {
						console.debug('Loading module via global: ' + this.config.modules[x].name);
						const gpath = path.resolve(this.globalPath, this.config.modules[x].name);
						module = require(gpath)(
							this.app,
							//require('../../../hardbox-session-passport')(
							this.config.modules[x].config
						);
						console.debug('Loaded module via global: ' + this.config.modules[x].name);
					} catch(e) {
						console.error(e);
						console.error('Failed to load module' + this.config.modules[x].name);
					}
				}
				if (module) this.modules.push(module);
			}
		}
	}

	executeModules(req, res, next) {
		this.app(req, res, next);
	}
};

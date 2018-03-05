'use strict';
//const config = Object.freeze(require('plain-config')());

module.exports = (config) => {
	const http = require('http');
	const https = require('https');
	const vhost = require('./lib/vhost');
	const fs = require('fs');
	const path = require('path');


// Holds vhost instances
	let oStack = {
		list: []
	};

// Holds all servers associed with their ports
	let serverList = {};

	function load(oStack, handler) {
		console.info('Reloading vhosts');
		let n = [];

		let portMap = {};

		fs.readdirSync(path.join(config.controller.vhost.path)).forEach(file => {
			if (file.match(/\.vhost\.js$/)) {
				let m = path.join(config.controller.vhost.path, file);
				try {
					// Forces reload of the file event if cached
					delete require.cache[m];
					let vh = require(m);
					console.info('Loading vhost: ' + vh.name);
					let ovh = new vhost(vh, config.node.global_path);
					if (portMap[ovh.config.vhost.port] && portMap[ovh.config.vhost.port] !== ovh.config.vhost.protocol) {
						throw new Error('Invalid configuration. Requested port already used by a different protocol: ' + ovh.config.vhost.port + ' mapped to ' + portMap[ovh.config.vhost.port])
					}
					portMap[ovh.config.vhost.port] = ovh.config.vhost.protocol;
					n.push(ovh);
				} catch (e) {
					console.error('Failed to load: ' + m);
					console.error(e);
					console.error('Broken vhost skipped located at: ' + m);
				}
			}
		});
		oStack.list = n;
		console.info('All vhosts reloaded');

		// Shutting down server ports that are not needed anymore;
		console.info('Shutting down any unneeded ports');
		for (let port in serverList) {
			if (serverList[port] && !portMap[port]) {
				console.info('Shutting down port:' + port);
				serverList[port].close();
				delete serverList[port];
			}
		}
		// Adding any missing ports
		console.info('Starting any additional ports');
		for (let port in portMap) {
			if (!serverList[port]) {
				let protocol = portMap[port];
				let s = require(protocol).createServer(handler).listen(port, (err) => {
					console.info('Listening on port %d', s.address().port)
				});
				serverList[port] = s;
				console.info('Started on port:' + port);
			}
		}
	}

	var handler = require('./lib/router.js')(oStack);

	load(oStack, handler);

	process.on('message', function (msg) {
		switch (msg.action) {
			case "reload":
				load(oStack, handler);
				break;
			default:
				console.warn('Unknown inter-process message received: ' + msg.action);
				break;
		}
	})
}
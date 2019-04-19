'use strict';
//const config = Object.freeze(require('plain-config')());

module.exports = (config) => {

	// Holds vhost instances
	const oStack = {
		list: []
	};

	// Holds all servers associed with their ports
	const serverList = {};

	const handler = require('./lib/router.js')(oStack);

	const load = require('./lib/load');
	load(config, oStack, serverList, handler);
	
	//load(oStack, serverList, handler);

	process.on('message', function (msg) {
		switch (msg.action) {
		case 'reload':
			load(config, oStack, serverList, handler);
			break;
		default:
			console.warn('Unknown inter-process message received: ' + msg.action);
			break;
		}
	});
};
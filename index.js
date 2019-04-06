'use strict';
//const config = Object.freeze(require('plain-config')());

module.exports = (config) => {

// Holds vhost instances
	let oStack = {
		list: []
	};

// Holds all servers associed with their ports
	let serverList = {};

	var handler = require('./lib/router.js')(oStack);

	require('./lib/load')(config, oStack, serverList, handler);
	
	//load(oStack, serverList, handler);

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
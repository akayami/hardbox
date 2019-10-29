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
	
	const loader = require('./lib/loader')(config, oStack, serverList, handler);
	loader.load();
	
	//console.info('Test', {id: 10});
	
	//load(oStack, serverList, handler);
	
	process.on('message', function (msg) {
		switch (msg.action) {
		case 'reload':
			loader.load();
			break;
		case 'stop':
			loader.close();
			break;
		default:
			console.warn('Unknown inter-process message received: ' + msg.action);
			break;
		}
	});
	
	return loader;
	
	// return {
	// 	reload: () => {
	// 		load(config, oStack, serverList, handler);
	// 	},
	// 	stop: () => {
	// 		require('./lib/close')(serverList, {});
	// 	}
	// }
};
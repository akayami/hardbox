const fs = require('fs');
const path = require('path');
const vhost = require('./vhost');

module.exports = (config, oStack, serverList, handler) => {
	
	const port_map = {}; // Holds a list of all ports and protocols;
	
	const output = {};
	
	output.load = () => {
		const arr_vhost_objects = []; // Holds a list of vhost Objects
		
		let arr_vhost_config = []; // Holds a list of vhost configurations
		
		if(config.controller.vhost) {
			
			if(config.controller.vhost.list) {
				arr_vhost_config = arr_vhost_config.concat(config.controller.vhost.list);
			}
			
			if(config.controller.vhost.path) {
				arr_vhost_config = arr_vhost_config.concat(require('./scan-vhost-dir')(config.controller.vhost.path));
			}
			
			if(arr_vhost_config) {
				arr_vhost_config.forEach(hostConf => {
					const ovh = new vhost(hostConf, config.node.global_path);
					if (port_map[ovh.config.vhost.port] && port_map[ovh.config.vhost.port] !== ovh.config.vhost.protocol) {
						throw new Error('Invalid configuration. Requested port already used by a different protocol: ' + ovh.config.vhost.port + ' mapped to ' + port_map[ovh.config.vhost.port]);
					}
					port_map[ovh.config.vhost.port] = ovh.config.vhost.protocol;
					arr_vhost_objects.push(ovh);
				});
			}
		}
		
		oStack.list = arr_vhost_objects;
		console.info('All vhosts reloaded');
		
		// Shutting down server ports that are not needed anymore;
		console.info('Shutting down any unneeded ports');
		output.close();
		// Adding any missing ports
		console.info('Starting any additional ports');
		for (const port in port_map) {
			if (!serverList[port]) {
				const protocol = port_map[port];
				const s = require(protocol).createServer(handler).listen(port, (err) => {
					console.info('Listening on port %d', s.address().port);
				});
				serverList[port] = s;
				console.info('Started on port:' + port);
			}
		}
	};
	
	output.close = () => {
		require('./close')(serverList, {});
	};
	
	return output;
	
};
const server = require('../index');
const config = {};

config.morgan = 'tiny'; // tiny/combined etc.

config.workers = 1;

// Sets up app output library (stdout and such)
config.bunyan = {
	name: 'hardbox',
	streams: [{
		level: 'error',	//debug, info, error
		stream: process.stdout
	}, ]
};

config.controller = {
	endpoint: [{
		server: require('http'),
		listen: {
			path: '/run/hardbox.sock'
		}
	}],
	vhost: {
		path: __dirname + '/vhost/'
	}
};


config.node = {
	global_path: '/usr/lib/node_modules'
};

let i;

describe('Testing server', () => {
	before(() => {
		i = server(config);
	});
	after(() => {
		i.close();
	});
	
	it('Needs to start and stop', (done) => {
		done();
	});
});
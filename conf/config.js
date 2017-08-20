const config = {};

config.morgan = 'tiny'; // tiny/combined etc.

// Sets up app output library (stdout and such)
config.bunyan = {
	name: 'hardbox',
	streams: [{
		level: 'info',	//debug, info, error
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
		path: '/etc/hardbox/conf.d/'
	}
};

module.exports = config;

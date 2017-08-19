const fs = require('fs');
const os = require('os');
const path = require('path')
const config = {};

config.morgan = 'tiny'; // tiny/combined etc.

// Sets up app output library (stdout and such)
config.bunyan = {
	name: 'hardbox',
	streams: [{
		level: 'debug',
		stream: process.stdout
	}, ]
};

config.children = {
	http: {
		port: 8088
	},
	https: {
		port: 8043,
		options: {
			key: fs.readFileSync(__dirname + '/keys/key.pem'), // dev keys
			cert: fs.readFileSync(__dirname + '/keys/cert.pem'), // dev
			// secret
			passphrase: 'pass' // dev keys
		}
	}
};

config.controller = {
	endpoint: [{
		server: require('http'),
		listen: {
			path: '/tmp/hardbox'
		}
	}],
	vhost: {
		path: '/etc/hardbox/conf.d/'
	}
}

module.exports = config;

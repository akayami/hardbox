const loader = require('../lib/loader');
const request = require('request');
const config = {};

config.morgan = 'tiny'; // tiny/combined etc.

config.workers = 1;

// Sets up app log library (stdout and such)
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
		list: [
			{
				name: 'test',
				vhost: {
					protocol: 'http',
					domain: 'localhost',
					port: '2299',
					pathname: '/'
				},
				morgan: {
					format: 'tiny',
					options: {}
				},
				modules: [
					{
						name: '/Users/tomasz.rakowski/dev/hardbox-proxy',
						config: {
							target: 'localhost:2300'
						}
					}
				]
			}
		],
		//		path: __dirname + '/vhost/'
	}
};

config.node = {
	global_path: '/usr/lib/node_modules'
};

let p;

describe('Test Load function', () => {
	
	it('Basic Start/Stop', (done) => {
		const oStack = {}, serverList = {};
		p = loader(config, oStack, serverList, (req, res) => {
			console.info('Handler called', req, res);
		});
		p.load();
		p.close();
		done();
	});
	
	
	it('Send Request', (done) => {
		
		const oStack = {}, serverList = {};
		p = loader(config, oStack, serverList, (req, res) => {
			res.end();
			done();
		});
		afterEach(() => {
			//console.debug('CLOSING');
			p.close();
		});
		p.load();
		request('http://localhost:2299/', (err, res, body) => {
			if(err) return done(err);
		});
		// p.close();
		// done();
	});
	
});
const assert = require('assert');
const vhost = require('../lib/vhost');
const request = require('request');

// Does this test make sense ?

describe('lib/vhost.js - Basic vhost setup', function () {
	
	
	it('Basic route handling without modules', (done) => {
		
		//let config = {};

		const port = 8018;
		
		const oStack = {
			list: [
				new vhost({
					name: 'test',
					vhost: `http://localhost:${port}/`,
					target: 'http://localhost:3000'
				})
			]
		};
		
		const handler = require('../lib/router.js')(oStack);
		
		let s;
		
		after(() => {
			if(s) s.close();
		});
		
		s = require('http').createServer(handler).listen(port, (err) => {
			if (err) {
				console.error(err);
				done(err);
			} else {
					
				const res = {};
					
				res.end = (message) => {
					if (res.statusCode !== 503) {
						done('Bad Response code: ' + res.statusCode + ' message ' + message);
					} else {
						done();
					}
				};
					
				handler(
					{
						url: '/',
						connection: {
							encrypted: false
						},
						headers: {
							host: `localhost:${port}`
						}
					}, res);
			}
		});
	});
});
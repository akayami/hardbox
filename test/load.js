const assert = require('assert');
const vhost = require('../lib/vhost');
const request = require('request');

const mockRequest = require('mock-req-res').mockRequest;
const mockResponse = require('mock-req-res').mockResponse;

describe('lib/load.js - Basic route management', function () {
	
	
	it('Basic route handling without modules', (done) => {
		
		//let config = {};

		let port = 8018;
		
		let oStack = {
			list: [
				new vhost({
					name: 'test',
					vhost: `http://localhost:${port}/`,
					target: 'http://localhost:3000'
				})
			]
		};
		
		let handler = require('../lib/router.js')(oStack);
		
		let s;
		
		after(() => {
			if(s) s.close();
		});
		
		s = require('http').createServer(handler).listen(port, (err) => {
				if (err) {
					console.error(err);
					done(err);
				} else {
					
					let res = {};
					
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
			})
	});
});
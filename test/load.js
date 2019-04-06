const assert = require('assert');
const vhost = require('../lib/vhost');
const request = require('request');

const mockRequest = require('mock-req-res').mockRequest;
const mockResponse = require('mock-req-res').mockResponse;

describe('Loading...', function () {
	
	
	it('Basic route handling without modules', (done) => {
		
		//let config = {};
		
		let oStack = {
			list: [
				new vhost({
					name: 'test',
					vhost: 'http://testdomain.local/',
					target: 'http://localhost:3000'
				})
			]
		};
		
		let handler = require('../lib/router.js')(oStack);
		
		let s;
		
		after(() => {
			if(s) s.close();
		});
		
		s = require('http').createServer(handler).listen(80, (err) => {
				if (err) {
					console.error(err);
					done(err);
				} else {
					
					let res = {};
					
					res.end = (message) => {
						if (res.statusCode !== 503) {
							done('Bad Response code')
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
								host: 'testdomain.local'
							}
						}, res);
				}
			})
	});
});
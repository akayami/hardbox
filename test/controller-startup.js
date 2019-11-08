const {should, expect} = require('chai');
const c = require('../lib/controller');
const server = require('http');
const request = require('request');
const fs = require('fs-extra');
const path = require('path');

const testRoot = '/tmp/hadbox-test';
const confPath = path.join(testRoot, 'conf.d/');

const socket = '/tmp/hardbox-unit';

const Propagator = require('../lib/propagator');

describe('Test controller startup routine', function () {

	let stack;

	const list = [];
	const propagator = new Propagator(list);

	beforeEach(function (done) {
		fs.mkdirp(confPath, err => {
			done(err);
		});
	});

	afterEach(function (done) {
		fs.remove(testRoot, function (err) {
			return done(err);
		});
	});

	it('Needs to start up normally', (done) => {
		stack = c(propagator, {
			endpoint: [{
				server: require('http'),
				listen: {
					path: socket
				}
			}],
			vhost: {
				path: confPath
			}
		}, function (err, r) {
			stack.close(() => {
				done(err);
			});
		});
	});

	it('It needs to recover when socket file exists', (done) => {
		fs.writeFile(socket, 'test', (err) => {
			if (err) return done(err);
			stack = c(propagator, {
				endpoint: [{
					server: require('http'),
					listen: {
						path: socket
					}
				}],
				vhost: {
					path: confPath
				}
			}, function (err, r) {
				stack.close(() => {
					done(err);
				});
			});
		});
	});

	it('It needs to fail when unable to create socket', (done) => {
		stack = c(propagator, {
			endpoint: [{
				server: require('http'),
				listen: {
					path: '/test'  // should not be able to make socket
				}
			}],
			vhost: {
				path: confPath
			}
		}, function (err, r) {
			stack.close(() => {
				expect(err.code).be.be.oneOf(['EACCES', 'EROFS']);
				done();
			});
		});
	});


	it('Needs to fail when another server is already running', (done) => {
		const listen =
		stack = c(propagator, {
			endpoint: [{
				server: require('http'),
				listen: {
					path: socket  // should not be able to make socket
				}
			}],
			vhost: {
				path: confPath
			}
		}, function (err, r) {
			if (err) return done(err);
			const p = c(propagator, {
				endpoint: [{
					server: require('http'),
					listen: {
						path: socket  // should not be able to make socket
					}
				}],
				vhost: {
					path: confPath
				}
			}, function (err, r) {
				p.close(() => {
					stack.close(() => {
						done();
					});
				});
			});
		});
	});

	// beforeEach(function(done) {
	// 	fs.mkdirp(confPath, err => {
	// 		stack = c(propagator, {
	// 			endpoint: [{
	// 				server: require('http'),
	// 				listen: {
	// 					path: socket
	// 				}
	// 			}],
	// 			vhost: {
	// 				path: confPath
	// 			}
	// 		}, function(err, r) {
	// 			done(err);
	// 		});
	// 	});
	// });
	//
	// afterEach(function(done) {
	// 	stack.close(function(err) {
	// 		if(err) {
	// 			return done(err);
	// 		}
	// 		fs.remove(testRoot, function(err) {
	// 			return done(err);
	// 		});
	// 	});
	// });
	//
	// it('Needs to startup with a path endpoint', function(done) {
	// 	request.put(`http://unix:${socket}:/vhost/set/vhost/key.value.sdsd/value`,function(error, response, body) {
	// 		if (error) {
	// 			done(error);
	// 		} else {
	// 			if (response.statusCode == 404) {
	// 				done();
	// 			} else {
	// 				done(response.statusCode)
	// 			}
	// 		}
	// 	});
	// });
	//
	// it('Needs to reload', function(done) {
	// 	fs.writeFileSync(path.join(confPath, 'file1.js'), `
	// 	module.exports = {
	//
	// 		name: 'test',
	//
	// 		vhost: {
	// 			protocol: 'https',
	// 			domain: 'test.dev',
	// 			port: '8043',
	// 			pathname: '/'
	// 		},
	// 		target: "http://localhost:3000",
	//
	// 		morgan: {
	// 			format: 'tiny',
	// 			options: {}
	// 		}
	// 	}
	// 	`);
	//
	// 	fs.writeFileSync(path.join(confPath, 'file2.js'), `
	// 	module.exports = {
	//
	// 		name: 'test',
	//
	// 		vhost: {
	// 			protocol: 'https',
	// 			domain: 'test.dev',
	// 			port: '8043',
	// 			pathname: '/'
	// 		},
	// 		target: "http://localhost:3000",
	//
	// 		morgan: {
	// 			format: 'tiny',
	// 			options: {}
	// 		}
	// 	}
	// 	`);
	//
	// 	request.get(`http://unix:${socket}:/reload`,function(error, response, body) {
	// 		if (error) {
	// 			done(error);
	// 		} else {
	// 			if (response.statusCode == 200) {
	// 				done();
	// 			} else {
	// 				done(response.statusCode);
	// 			}
	// 		}
	// 	});
	//});
});

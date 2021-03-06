const http = require('http');
const https = require('https');
const express = require('express');
const async = require('async');
// const bodyParser = require('body-parser');
// const tomlify = require('tomlify-j0.4');
const path = require('path');
// const toml = require('toml');
const fs = require('fs');

module.exports = function(propagator, config, callback) {
	
	const app = express();

	app.get('/reload', function(req, res, next) {
		propagator.trigger('reload');
		res.status(200).end();
	});


	const servers = [];
	const tasks = [];
	
	for (let x = 0; x < config.endpoint.length; x++) {
		tasks.push(function(asyncCB) {
			const i = ((function(endpoint) {
				const server = http.createServer(app);
				// Based on
				// https://stackoverflow.com/questions/16178239/gracefully-shutdown-unix-socket-server-on-nodejs-running-under-forever
				server.on('error', function(e) {
					if (e.code == 'EADDRINUSE') {
						const s = new http.createServer(app);
						s.on('error', function(e) { // handle error trying to talk to server
							//console.error(e);
							if (e.code == 'EADDRINUSE') { // No other server listening
								//console.info(endpoint.listen.path);
								fs.unlinkSync(endpoint.listen.path);
								server.listen(endpoint.listen.path, function() { //'listening' listener
									console.info('server recovered');
								});
							}
						});
						s.listen({
							path: endpoint.listen.path
						}, function() {
							console.info('Server running, giving up...');
						});
					} else {
						asyncCB(e);
					}
				});
				server.on('listening', () => {
					console.info('Controller interface Up!');
					asyncCB();
				});
				server.listen(endpoint.listen);
				return server;
			})(config.endpoint[x]));
			servers.push(i);
		});
		async.parallel(tasks, callback);
	}

	return {
		close: function(callback) {
			const t = [];
			servers.forEach(function(srv) {
				t.push(function(asyncCB) {
					this.srv.close(function(err) {
						asyncCB(err);
					});
				}.bind({
					srv: srv
				}));
			});
			async.parallel(t, callback);
		}
	};
};

const config = Object.freeze(require('plain-config')());
const bunyan = require('bunyan');

global.logger = bunyan.createLogger(config.bunyan);
require('console2log/bunyan').attach(global.logger).disableConsole(true);

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;


const Propagator = require('./lib/propagator');

const stack = [];
const propagator = new Propagator(stack);


if (cluster.isMaster) {

	require('./lib/controller')(propagator, config.controller, function(err, res) {

		function newWorker() {
			var worker = cluster.fork();
			worker.on('exit', function(code, signal) {
				if (signal) {
					console.log(`Worker killed by signal: ${signal}`);
				} else if (code !== 0) {
					console.log(`worker exited with error code: ${code}`);
				} else {
					console.log('worker success!');
				}
			})
			return worker;
		}

		// Fork workers.
		for (var i = 0; i < numCPUs; i++) {
			var worker = newWorker();
			stack.push(worker);
		}

		var event = cluster.on('exit', function(deadWorker, code, signal) {
			var worker = newWorker();
			stack.push(worker);

			// Note the process IDs
			var newPID = worker.process.pid;
			var oldPID = deadWorker.process.pid;

			// Log the event
			console.log('worker ' + oldPID + ' died.');
			console.log('worker ' + newPID + ' born.');

		});

	})
} else {
	require('./index.js');
}

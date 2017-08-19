const config = Object.freeze(require('plain-config')());
const http = require('http');
const https = require('https');
const vhost = require('./lib/vhost');
const fs = require('fs');
const path = require('path');


let oStack = {
	list: []
}

//var vhstack = [];

function load(oStack) {
	console.info('Reloading vhosts');
	var n = [];
	fs.readdirSync(path.join(config.controller.vhost.path)).forEach(file => {
		if (file.match(/\.vhost\.js$/)) {
			let m = path.join(config.controller.vhost.path, file);
			try {
				// Forces reload of the file event if cached
				delete require.cache[m];
				let vh = require(m);
				console.info('Loading vhost: ' + vh.name);
				n.push(new vhost(vh));
			} catch(e) {
				console.error('Failed to load: ' + m);
				console.error(e);
				console.error('Broken vhost skipped located at: ' + m);
			}
		}
	});
	oStack.list = n;
	console.info('All vhosts reloaded');
}

var handler = require('./lib/router.js')(oStack);

var server = http.createServer(handler).listen(config.children.http.port, function() {
	console.log('Listening on port %d', server.address().port);
});

var secure = https.createServer(config.children.https.options, handler).listen(config.children.https.port, function() {
	console.log('Listening on port %d', secure.address().port);
});

load(oStack);

process.on('message', function(msg) {
	switch (msg.action) {
		case "reload":
			load(oStack);
			break;
		default:
			console.warn('Unknown inter-process message received: ' + msg.action);
			break;
	}
})

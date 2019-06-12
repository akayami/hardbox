const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({
	xfwd: true
});
const URL = require('url').URL;

module.exports = function(oStack) {

	return function(req, res) {
		const current = new URL(req.url, (req.connection.encrypted ? 'https' : 'http') + '://' + req.headers.host);
		let matched;
		for (let x = 0; x < oStack.list.length; x++) {
			if (oStack.list[x].match(current)) {
				matched = oStack.list[x];
				break;
			}
		}
		if (matched) {
			//res.proxyHeaders = [];
			matched.executeModules(req, res, function(err, preq, pres) {
				if (err) {
					if (err.getStatus) {
						res.statusCode = err.getStatus();
					} else {
						res.statusCode = 500;
					}
					console.error(err);
					res.end();
				} else {
					res.statusCode = 503;
					res.end('Virtual Host Misconfigured');
					// proxy.on('proxyReq', function(proxyReq, req, res, options) {
					// 	for (var x = 0; x < res.proxyHeaders.length; x++) {
					// 		proxyReq.setHeader(res.proxyHeaders[x][0], res.proxyHeaders[x][1]);
					// 	}
					// 	proxyReq.setHeader('x-powered-by', 'Hardbox Reverse Proxy');
					// });
					//
					// proxy.web(req, res, {
					// 	target: matched.target()
					// }, function(e) {
					// 	console.error(e);
					// 	res.statusCode = 503;
					// 	res.end();
					// })
				}
			});
		} else {
			if(req.url === '/ping') {
				res.statusCode = 200;
				res.end('OK');
			}  else {
				console.warn('Unsupported: ' + current);
				res.statusCode = 400;
				res.end('Requested domain name not supported');
			}
		}
	};
};

const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({
	xfwd: true
});
const URL = require('url').URL;

module.exports = function(oStack) {

	return function(req, res) {
		var current = new URL(req.url, (req.connection.encrypted ? 'https' : 'http') + '://' + req.headers.host);
		var matched;
		for (var x = 0; x < oStack.list.length; x++) {
			if (oStack.list[x].match(current)) {
				matched = oStack.list[x];
				break;
			}
		}
		if (matched) {
			res.proxyHeaders = [];
			matched.executeModules(req, res, function(err, req, res) {
				if (err) {
					if (err.getStatus) {
						res.statusCode = err.getStatus();
					} else {
						res.statusCode = 500
					}
					res.end();
				} else {
					proxy.on('proxyReq', function(proxyReq, req, res, options) {
						for (var x = 0; x < res.proxyHeaders.length; x++) {
							proxyReq.setHeader(res.proxyHeaders[x][0], res.proxyHeaders[x][1]);
						}
						proxyReq.setHeader('x-powered-by', 'Hardbox Reverse Proxy');
					});

					proxy.web(req, res, {
						target: matched.target()
					}, function(e) {
						console.error(e);
						res.statusCode = 503;
						res.end();
					})
				}
			});
		} else {
			res.statusCode = 400;
			res.end('Requested domain name not supported');
		}
	};
}

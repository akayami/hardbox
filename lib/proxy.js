module.exports = (config) => {
	
	const httpProxy = require('http-proxy');
	const proxy = httpProxy.createProxyServer({
		xfwd: true
	});
	
	return (req, res, next) => {
		
		proxy.on('proxyReq', function(proxyReq, req, res, options) {
			if(res.proxyHeaders) {
				for (var x = 0; x < res.proxyHeaders.length; x++) {
					proxyReq.setHeader(res.proxyHeaders[x][0], res.proxyHeaders[x][1]);
				}
			}
			proxyReq.setHeader('x-powered-by', 'Hardbox Reverse Proxy');
		});
		
		proxy.web(req, res, {
			target: config.target
		}, function(e) {
			console.error(e);
			res.statusCode = 503;
			res.end();
		});
	}
};
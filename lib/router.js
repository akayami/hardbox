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
				//console.log(err, preq, pres);
				if (err) {
					if (err.getStatus) {
						res.statusCode = err.getStatus();
					} else {
						res.statusCode = 500;
					}
					res.end();
				} else {
					res.end();
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

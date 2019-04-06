describe('Proxy', () => {
	it('Needs to proxy', (done) => {
		const port = 31313;
		const port2 = 21212;
		
		const handler = (req, res) => {
			let proxy = require('../lib/proxy')({
				target: `http://localhost:${port2}`
			});
			proxy(req, res);
		};
		
		let ser1, ser2;
		
		after(() => {
			if(ser1) ser1.close();
			if(ser2) ser2.close();
		});
		
		ser1 = require('http').createServer(handler).listen(port,(err) => {
			if(err) {
				done(err);
			} else {
				ser2 = require('http').createServer((req, res) => {
					res.write('ok');
					res.end()
				}).listen(port2, (err) => {
					if (err) {
						done(err);
					} else {
						require('request')(`http://localhost:${port}/`, (err, res, body) => {
							if (res.statusCode === 200 && body === 'ok') {
								done();
							} else {
								done('Wrong Error code');
							}
						});
					}
				});
			}
		})
		
	});
});
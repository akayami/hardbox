const func = require('../lib/scan-vhost-dir');
const path = __dirname + '/vhost/';

describe('Test the scan-vhost-dir function', () => {
	it('Needs to load contents', () => {
		let o = func(path);
	});
});
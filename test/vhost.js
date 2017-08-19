const vhost = require('../lib/vhost.js');
const assert = require('assert');

describe('Test url maching', function() {

	it('Needs to match object type url', function() {
		var p = new vhost({
			vhost: {
				protocol: 'https',
				domain: 'test.domain.com',
				port: '443',
				pathname: '/test'
			}
		});
		assert(p.match({
			href: 'https://test.domain.com/test/'
		}));
	})

	it('Needs to match string type url', function() {
		var p = new vhost({
			vhost: 'https://test.domain.com:443/test'
		});
		assert(p.match({
			href: 'https://test.domain.com/test/hello'
		}));
	})

})

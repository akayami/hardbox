const func = require('../lib/scan-vhost-dir');
const path = __dirname + '/vhost/';
const {should, expect} = require('chai');

describe('Test the scan-vhost-dir function', () => {
	it('Needs to load contents', () => {
		const o = func(path);
		expect(o).to.be.an('array').of.length(1);
		expect(o[0]).to.be.an('object');
		expect(o[0].name).to.be.a('string').equal('test');
		expect(o[0].vhost).to.be.an('object');
	});
});
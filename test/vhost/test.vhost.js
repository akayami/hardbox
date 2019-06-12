module.exports = {
	name: 'test',
	vhost: {
		protocol: 'http',
		domain: 'domain.local',
		port: '2299',
		pathname: '/'
	},
	morgan: {
		format: 'tiny',
		options: {}
	},
	modules: [
		{
			name: '/Users/tomasz.rakowski/dev/hardbox-proxy',
			config: {
				target: 'localhost:2300'
			}
		}
	]
};
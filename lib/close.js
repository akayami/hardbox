module.exports = (serverList, portMap = {}) => {
	for (const port in serverList) {
		if (serverList[port] && !portMap[port]) {
			console.info('Shutting down port:' + port);
			serverList[port].close(() => {
				console.debug('Instance shut down');
			});
			delete serverList[port];
		}
	}
};
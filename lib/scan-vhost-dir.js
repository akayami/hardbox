const fs = require('fs');
const path = require('path');


module.exports = (pathname) => {
	const output = [];
	fs.readdirSync(path.join(pathname)).forEach(file => {
		if (file.match(/\.vhost\.js$/)) {
			try {
				console.debug('Loading vhost from file: ' + path.join(pathname, file));
				const m = path.join(pathname, file);
				delete require.cache[m];
				output.push(require(m));
			} catch(e) {
				console.error(e);
			}
		}
	});
	return output;
};
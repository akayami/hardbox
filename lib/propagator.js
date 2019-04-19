const EventEmitter = require('events');

module.exports = class Propagator {

	constructor(stack) {
		this.stack = stack;
	}

	trigger(action, data = null) {
		for(let x = 0; x < this.stack.length; x++) {
			this.stack[x].process.send({
				action: action,
				payload: data
			});
		}
	}
};

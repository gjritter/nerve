String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, '');
}
# Nerve

A microframework for [node.js](http://nodejs.org).

## Examples

[Nodewiki](http://github.com/gjritter/nodewiki) is a tiny wiki built using Nerve and the redis-node-client.

This is a sample application that makes use of Nerve's regular-expression URI path matching to pass a "name" parameter from the URI into a handler function. This can be extended to any number of named arguments in the handler function.

	require("./nerve");
	
	var app = [
		[/^\/hello\/(\w+)$/, function(req, res, name) {
			res.send_html("Hello, " + name + "!");
		}],
	].serve(8000);

# Nerve

A microframework for [node.js](http://nodejs.org).

## Examples

### Nodewiki

[Nodewiki](http://github.com/gjritter/nodewiki) is a tiny wiki built using Nerve and the redis-node-client.

### Sample Application

This sample application makes use of Nerve's regular-expression URI path matching to pass a "name" parameter from the URI into a handler function. This can be extended to any number of named arguments in the handler function.

It also makes use of request method matching. The first matcher will only match get requests; the second will match any request method.

    var nerve = require("./nerve");

    // define an application using request matcher/handler pairs
    var app = [

    	// will respond only to GET requests
    	[get(/^\/hello\/(\w+)$/), function(req, res, name) {
    		// respond takes a string and provides sensible defaults:
    		// Content-Type: text/html, Content-Length: string length
    		res.respond("Hello, " + name + "!");
    	}],
	
    	// will respond to any request method
    	[/^\/goodbye$/, function(req, res) {
    		// respond takes an object specifying content and headers,
    		// and uses sensible defaults if not supplied
    		res.respond({content: "Goodbye!", headers: {"Content-Type": "text/plain"}});
    	}]
	
    ];

    // create and serve the application
    nerve.create(app).serve(8000);
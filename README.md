# Nerve

A microframework for [node.js](http://nodejs.org).

## Features

* Simple array-based DSL for request routing
* Regular expression route matching, including passing of captured groups to route handler
* Simple cookie and session support

## Examples

### Hello World

This Hello World app listens for http requests on port 8000:

    var nerve = require('./nerve');

    var hello = [
    	["/", function(req, res) {
    		res.respond("Hello, World!");
    	}]
    ];

    nerve.create(hello).listen(8000);

### Nodewiki

[Nodewiki](http://github.com/gjritter/nodewiki) is a tiny wiki built using Nerve and the redis-node-client.

### Templates

The [template.node.js](http://github.com/jazzychad/template.node.js) project includes a sample application that shows how Nerve can be used to build a web application with templates.

### Sample Application

This sample application makes use of Nerve's regular-expression URI path matching to pass a "name" parameter from the URI into a handler function. This can be extended to any number of named arguments in the handler function.

It also makes use of request method matching. The first matcher will only match get requests; the second will match any request method.

The application stores the user's name in the session, so that it can be used in subsequent responses.

    var posix = require("./posix");
    var nerve = require("./nerve"),
      get = nerve.get;

    // define an application using request matcher/handler pairs
    var app = [

    	// this handler will only respond to GET requests
    	[get(/^\/hello\/(\w+)$/), function(req, res, name) {
		
    		// the session is available on every request; it currently
    		// lasts for the browser session, but will soon be configurable.
    		req.session["name"] = name;
		
    		// respond takes a string and provides sensible defaults:
    		// Content-Type: text/html, Content-Length: string length
    		res.respond("Hello, " + name + "!");
		
    	}],
	
    	// this handler will respond to any request method
    	[/^\/goodbye$/, function(req, res) {
		
    		var name = req.session["name"];
    		var message = "Goodbye, " + (name || "I hardly knew thee") + "!";

    		// respond takes an object specifying content and headers,
    		// and uses sensible defaults if not supplied
    		res.respond({content: message, headers: {"Content-Type": "text/plain"}});
		
    	}]
	
    ];

    // create and serve the application with 10 second session duration
    nerve.create(app, {session_duration: 10000}).listen(8000);

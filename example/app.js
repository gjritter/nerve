/*global require */
'use strict';

(function () {
	var nerve = require("../lib/nerve"),
		get = nerve.get,
		// define an application using request matcher/handler pairs
		app = [

			// this handler will only respond to GET requests
			[get(/^\/hello\/(\w+)$/), function (req, res, name) {
		
				// the session is available on every request; it currently
				// lasts for the browser session, but will soon be configurable.
				req.session.name = name;
		
				// respond takes a string and provides sensible defaults:
				// Content-Type: text/html, Content-Length: string length
				res.respond("Hello, " + name + "!");
		
			}],
	
			// this handler will respond to any request method
			[/^\/goodbye$/, function (req, res) {
		
				var name = req.session.name,
					message = "Goodbye, " + (name || "I hardly knew thee") + "!";

				// respond takes an object specifying content and headers,
				// and uses sensible defaults if not supplied
				res.respond({content: message, headers: {"Content-Type": "text/plain"}});
		
			}]
	
		];

	// create and serve the application with 10 second session duration
	nerve.create(app, {session_duration: 10000, document_root: '.'}).listen(8000);
}());

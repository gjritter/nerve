var posix = require("posix"),
	nerve = require("./nerve"),
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

// create and serve the application with various options
posix.cat('server.crt').addCallback(function(cert) {
	posix.cat('server.key').addCallback(function(key) {
		nerve.create(app, {
			port: 8123,
			ssl_port: 8443,
			certificate: cert,
			private_key: key,
			session_duration: 10*1000
		}).serve();
	});
});
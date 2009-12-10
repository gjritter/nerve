var nerve = require("./nerve");

// define an application using request matcher/handler pairs
var app = [

	// will respond only to GET requests
	[get(/^\/hello\/(\w+)$/), function(req, res, name) {
		res.set_cookie("name", name);
		// respond takes a string and provides sensible defaults:
		// Content-Type: text/html, Content-Length: string length
		res.respond("Hello, " + name + "!");
	}],
	
	// will respond to any request method
	[/^\/goodbye$/, function(req, res) {
		// respond takes an object specifying content and headers,
		// and uses sensible defaults if not supplied
		res.respond({content: "Goodbye, " + req.get_cookie("name") + "!", headers: {"Content-Type": "text/plain"}});
	}]
	
];

// create and serve the application
nerve.create(app).serve(8000);
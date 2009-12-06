var nerve = require("./nerve");

// define an application using request matcher/handler pairs
var app = [

	// will respond only to GET requests
	[get(/^\/hello\/(\w+)$/), function(req, res, name) {
		res.send_html("Hello, " + name + "!");
	}],
	
	// will respond to any request method
	[/^\/goodbye$/, function(req, res) {
		res.send_html("Goodbye!");
	}]
	
];

// create and serve the application
nerve.create(app).serve(8000);
require("./nerve");

var app = [
	// will respond only to GET requests
	[get(/^\/hello\/(\w+)$/), function(req, res, name) {
		res.send_html("Hello, " + name + "!");
	}],
	// will respond to any request method
	[/^\/goodbye$/, function(req, res) {
		res.send_html("Goodbye!");
	}]
].serve(8000);
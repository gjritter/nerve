require("./nerve");

var app = [
	[/^\/hello\/(\w+)$/, function(req, res, name) {
		res.send_html("Hello, " + name + "!");
	}],
	[/^\/goodbye$/, function(req, res) {
		res.send_html("Goodbye!");
	}]
].serve(8000);

# Nerve

A microframework for [node.js](http://nodejs.org).

## Example

  require("./nerve");

  var app = [
  	[/^\/hello$/, function(req, res) {
  		res.send_html("Hello!");
  	}],
  	[/^\/goodbye$/, function(req, res) {
  		res.send_html("Goodbye!");
  	}]
  ].serve(8000);
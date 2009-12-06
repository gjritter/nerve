var sys = require('sys');
var http = require('http');

get = function(regexp) {
	return function() { return this.method == "GET" ? regexp : false; }
};

post = function(regexp) {
	return function() { return this.method == "POST" ? regexp : false; }
};

put = function(regexp) {
	return function() { return this.method == "PUT" ? regexp : false; }
};

del = function(regexp) {
	return function() { return this.method == "DELETE" ? regexp : false; }
};

(function() {
	function send_html(content, status_code) {
		this.sendHeader(status_code || 200, {"Content-Type":"text/html","Content-Length":content.length});
		this.sendBody(content);
		this.finish();
	}

	function is_regexp(matcher) {
		// assuming that if the matcher has a test function, it's a regexp
		// what is a better way of differentiating a regexp from a regular function?
		return typeof matcher.test === "function";
	}

	function create(app) {
		function request_handler(req, res) {
			res.send_html = send_html;
			for(var i = 0; i < app.length; i++) {
				var matcher = app[i][0], handler = app[i][1],
					match = req.uri.path.match(is_regexp(matcher) ? matcher : matcher.apply(req));
				if(match) {
					try {
						handler.apply(null, [req, res].concat(match.slice(1)));
					} catch(e) {
						res.send_html('<html><head><title>Exception</title></head><body><h1>Exception</h1><pre>' + sys.inspect(e) + '</pre></body></html>', 501);
					}
					return;
				}
			}
			res.send_html('<html><head><title>Not Found</title></head><body><h1>Not Found</h1></body></html>', 404);
		}

		return {
			serve: function(port, host) {
				http.createServer(request_handler).listen(port, host);
				
				return this;
			}
		}
	};
	
	exports.create = create;
})();
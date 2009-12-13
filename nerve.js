var sys = require('sys');
var http = require('http');
require('./http-state');

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
	var sessions = {};
	
	process.mixin(http.ServerResponse.prototype, {
		respond: function(response_data) {
			var headers = {
				"Content-Type": "text/html",
				"Content-Length": (response_data.content && response_data.content.length) || response_data.length || 0,
			}
			if(this.cookies) headers["Set-Cookie"] = this.cookies.join(", ");
			for(name in response_data.headers) headers[name] = response_data.headers[name];
			this.sendHeader(response_data.status_code || 200, headers);
			this.sendBody(response_data.content || response_data);
			this.finish();
		}
	});
	
	function is_regexp(matcher) {
		return matcher.constructor === RegExp;
	}
	
	function create(app, options) {
		function request_handler(req, res) {
			req.session = req.get_or_create_session(req, res, {duration: options.session_duration || 30*60*1000});
			for(var i = 0; i < app.length; i++) {
				var matcher = app[i][0], handler = app[i][1],
					match = req.uri.path.match(is_regexp(matcher) ? matcher : matcher.apply(req));
				if(match) {
					try {
						handler.apply(null, [req, res].concat(match.slice(1)));
					} catch(e) {
						res.respond({content: '<html><head><title>Exception</title></head><body><h1>Exception</h1><pre>' + sys.inspect(e) + '</pre></body></html>', status_code: 501});
					}
					return;
				}
			}
			res.respond({content: '<html><head><title>Not Found</title></head><body><h1>Not Found</h1></body></html>', status_code: 404});
		}

		var server = http.createServer(request_handler);
		
		return {
			serve: function(port, host) {
				server.listen(port, host);
				return this;
			},
			
			close: function() {
				server.close();
				return this;
			}
		}
	};
	
	exports.create = create;
})();
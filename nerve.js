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
	
	function is_matcher(matcher) {
		return matcher.constructor === RegExp || typeof matcher === 'string';
	}
	
	function create(app, options) {
		function request_handler(req, res) {
			req.session = req.get_or_create_session(req, res, {duration: options.session_duration || 30*60*1000});
			for(var i = 0; i < app.length; i++) {
				var matcher = app[i][0], handler = app[i][1],
					match = req.uri.path.match(is_matcher(matcher) ? matcher : matcher.apply(req));
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

		options = options || {};
		if(!options.port && !options.ssl_port) options.port = 8000;
		
		if(options.port) {
			var server = http.createServer(request_handler);
		}
		
		if(options.ssl_port && options.private_key && options.certificate) {
			var ssl_server = http.createServer(request_handler);
			ssl_server.setSecure('X509_PEM', options.ca_certs, options.crl_list, options.private_key, options.certificate);
		}
		
		return {
			serve: function() {
				if(server) server.listen(options.port, options.host);
				if(ssl_server) ssl_server.listen(options.ssl_port, options.host);
				return this;
			},
			
			close: function() {
				if(server) server.close();
				if(ssl_server) ssl_server.close();
				return this;
			}
		}
	};
	
	exports.create = create;
})();
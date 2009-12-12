var sys = require('sys');
var http = require('http');
var idgen = require('./idgen');
var util = require('./util');

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
	
	process.mixin(http.IncomingMessage.prototype, {
		get_cookie: function(name) {
			var cookies = this.headers.cookie && this.headers.cookie.split(";");
			while(cookie = (cookies && cookies.shift())) {
				var parts = cookie.split("=");
				if(parts[0].trim() === name) return parts[1];
			}
		}
	});
	
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
		},
		
		set_cookie: function(name, value) {
			this.cookies = this.cookies || [];
			this.cookies.push(name + "=" + value + "; path=/;");
		}
	});
	
	function is_regexp(matcher) {
		// assuming that if the matcher has a test function, it's a regexp
		// what is a better way of differentiating a regexp from a regular function?
		return typeof matcher.test === "function";
	}
	
	function get_or_create_session(req, res) {
		var session_id = req.get_cookie("session_id");
		if(!session_id) {
			session_id = idgen.generate_id(22);
			res.set_cookie("session_id", session_id);
		}
		sessions[session_id] = (sessions[session_id] || {
			session: {},
			touch: function() {
				// TODO: replace 30 minute expiration with something configurable
				this.expiration = (+ new Date) + 10*1000;
				return this;
			}
		}).touch();
		return sessions[session_id].session;
	}
	
	function cleanup_sessions() {
		for(session_id in sessions) {
			if((+ new Date) > sessions[session_id].expiration) {
				delete sessions[session_id];
			}
		}
	}

	function create(app) {
		setInterval(cleanup_sessions, 1000);
		function request_handler(req, res) {
			req.session = get_or_create_session(req, res);
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
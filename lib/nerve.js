/*global require, process, exports */
'use strict';

(function () {
	var sys = require('sys'),
		http = require('http'),
		url = require('url'),
		path = require('path'),
		posix = require('posix'),
		mime = require('./mime');
	require('./http_state');

	process.mixin(http.ServerResponse.prototype, {
		respond: function (response_data) {
			var headers = {
				'Content-Type': 'text/html',
				'Content-Length': (response_data.content && response_data.content.length) || response_data.length || 0
			}, name;
			if (this.cookies) {
				headers['Set-Cookie'] = this.cookies.join(', ');
			}
			for (name in response_data.headers) {
				if (response_data.headers.hasOwnProperty(name)) {
					headers[name] = response_data.headers[name];
				}
			}
			this.sendHeader(response_data.status_code || 200, headers);
			this.sendBody(response_data.content || response_data, 'binary');
			this.finish();
		}
	});
	
	function match_request(matcher, req) {
		if (typeof matcher === 'string') {
			return (matcher === req.url);
		} else if (matcher.constructor === RegExp) {
			return req.url.match(matcher);
		} else {
			return req.url.match(matcher.apply(req));
		}
	}
	
	function to_regexp(pattern) {
		if (pattern.constructor === RegExp) {
			return pattern;
		} else {
			return new RegExp('^' + pattern + '$');
		}
	}
	
	function get(pattern) {
		return function () {
			if (this.method !== 'GET') {
				return false;
			} else {
				return to_regexp(pattern);
			}
		};
	}

	function post(pattern) {
		return function () {
			if (this.method !== 'POST') {
				return false;
			} else {
				return to_regexp(pattern);
			}
		};
	}

	function put(pattern) {
		return function () {
			if (this.method !== 'PUT') {
				return false;
			} else {
				return to_regexp(pattern);
			}
		};
	}

	function del(pattern) {
		return function () {
			if (this.method !== 'DELETE') {
				return false;
			} else {
				return to_regexp(pattern);
			}
		};
	}

	function serve_static_file(pathname, res) {
		path.exists(pathname, function (exists) {
			if (exists) {
				posix.cat(pathname, 'binary').addCallback(function (content) {
					res.respond({content: content, headers: {'Content-Type': mime.mime_type(pathname)}});
				}).addErrback(function (e) {
					res.respond({content: '<html><head><title>Exception</title></head><body><h1>Exception</h1><pre>' + sys.inspect(e) + '</pre></body></html>', status_code: 501});
				});
			} else {
				res.respond({content: '<html><head><title>Not Found</title></head><body><h1>Not Found</h1></body></html>', status_code: 404});
			}
		});
	}

	function create(app, options) {
		var matcher, handler, handler_args, match, pathname;
		options = options || {};
		function request_handler(req, res) {
			req.session = req.get_or_create_session(req, res, {duration: options.session_duration || 30 * 60 * 1000});
			for (var i = 0; i < app.length; i += 1) {
				matcher = app[i][0];
				handler = app[i][1];
				handler_args = [req, res];
				match = match_request(matcher, req);
				if (match) {
					try {
						if (typeof match.slice === 'function') {
							handler_args = handler_args.concat(match.slice(1));
						}
						handler.apply(null, handler_args);
					} catch (e) {
						res.respond({content: '<html><head><title>Exception</title></head><body><h1>Exception</h1><pre>' + sys.inspect(e) + '</pre></body></html>', status_code: 501});
					}
					return;
				}
			}
			// no matching handler found; check for file if document_root option provided
			if(options.document_root) {
				pathname = options.document_root + unescape(url.parse(req.url).pathname).replace(/\.{2,}\//g, './');
				serve_static_file(pathname, res);
			} else {
				res.respond({content: '<html><head><title>Not Found</title></head><body><h1>Not Found</h1></body></html>', status_code: 404});
			}
		}

		return http.createServer(request_handler);
	}
	
	exports.get = get;
	exports.post = post;
	exports.put = put;
	exports.del = del;
	exports.create = create;
}());

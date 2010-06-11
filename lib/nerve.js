/*global require, process, exports */
'use strict';

(function () {
    var sys = require('sys'),
        http = require('./http_state'),
        url = require('url'),
        path = require('path'),
        fs = require('fs'),
        mime = require('./mime'),
        _ = require('./underscore')._.noConflict();


    http.ServerResponse.prototype.respond = function respond(response_data) {
        var headers = {
            'Content-Type': 'text/html',
            'Content-Length': (response_data.content && response_data.content.length) || response_data.length || 0
        };

        if (this.cookies) {
            headers['Set-Cookie'] = this.cookies.join(', ');
        }

        _.extend(headers, response_data.headers);

        this.writeHead(response_data.status_code || 200, headers);
        this.write(response_data.content || response_data, 'binary');
        this.end();
    };


    function match_request(matcher, req) {
        if (_.isString(matcher)) {
            return (matcher === req.url);
        } else if (_.isRegExp(matcher)) {
            return req.url.match(matcher);
        } else {
            return req.url.match(matcher.apply(req));
        }
    }


    function to_regexp(pattern) {
        if (_.isRegExp(pattern)) {
            return pattern;
        } else {
            return new RegExp('^' + pattern + '$');
        }
    }


    function method_matcher(method, pattern) {
        return function() {
            if (this.method !== method) {
                return false;
            } else {
                return to_regexp(pattern);
            }
        }
    }


    function get(pattern) {
        return method_matcher('GET', pattern);
    }


    function post(pattern) {
        return method_matcher('POST', pattern);
    }


    function put(pattern) {
        return method_matcher('PUT', pattern);
    }


    function del(pattern) {
        return method_matcher('DELETE', pattern);
    }


    function exception_response(err) {
        return {
            content: '<html><head><title>Exception</title></head><body><h1>Exception</h1><pre>' + sys.inspect(err) + '</pre></body></html>',
            status_code: 501
        };
    }


    var notfound_response = {
        content: '<html><head><title>Not Found</title></head><body><h1>Not Found</h1></body></html>',
        status_code: 404
    };


    var notfile_response = {
        content: '<html><head><title>Error</title></head><body><h1>Not a file</h1></body></html>',
        status_code: 501
    };


    function serve_static_file(pathname, res) {
        path.exists(pathname, function (exists) {
            if (exists) {
                fs.stat(pathname, function (err, stats) {
                    if (err) {
                        res.respond(exception_response(err));
                    } else {
                        if (stats.isFile()) {
                            fs.readFile(pathname, 'binary', function (err, data) {
                                if (err) {
                                    res.respond(exception_response(err));
                                } else {
                                    res.respond({
                                        content: data,
                                        headers: {
                                            'Content-Type': mime.mime_type(pathname)
                                        }
                                    });
                                }
                            });
                        } else {
                            res.respond(notfile_response);
                        }
                    }
                });
            } else {
                res.respond(notfound_response);
            }
        });
    }


    function create(app, options) {
        options = options || {};

        function request_handler(req, res) {
            var handler_match, handler_args = [req, res], pathname;

            req.session = req.get_or_create_session(req, res, {
                duration: options.session_duration || 30 * 60 * 1000
            });

            handler_match = _(app).chain()
                .map(function(entry) { return { handler: entry[1], match: match_request(entry[0], req) }; })
                .detect(function(handler_match) { return !!(handler_match.match); })
                .value();

            if (handler_match && handler_match.match) {
                try {
                    if (_.isFunction(handler_match.match.slice)) {
                        handler_args = handler_args.concat(handler_match.match.slice(1));
                    }
                    handler_match.handler.apply(null, handler_args);
                } catch (e) {
                    res.respond(exception_response(e));
                }
            } else {
                // no matching handler found; check for file if document_root option provided
                if (options.document_root) {
                    pathname = options.document_root + unescape(url.parse(req.url).pathname).replace(/\.{2,}\//g, './');
                    serve_static_file(pathname, res);
                } else {
                    res.respond(notfound_response);
                }
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

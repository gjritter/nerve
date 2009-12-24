/*global require, process, setTimeout */
'use strict';

(function () {
	var test = require('mjsunit'),
		http = require('http'),
		nerve = require('./nerve'),
		get = nerve.get,
		post = nerve.post,
		put = nerve.put,
		del = nerve.del,
		pending_callbacks = 0,
		test_server;
	
	// helpers
	
	function assert_response(response, expected_body, callback) {
		var body = '';
		response.addListener('body', function (chunk) {
			body += chunk;
		});
		response.addListener('complete', function () {
			test.assertEquals(expected_body, body);
		});
		if(typeof callback === 'function') {
			callback();
		} else if(typeof callback === 'undefined') {
			receive_callback();
		}
	}
	
	function assert_not_found(res) {
		test.assertEquals(404, res.statusCode);
		test.assertEquals('text/html', res.headers['content-type']);
		assert_response(res, '<html><head><title>Not Found</title></head><body><h1>Not Found</h1></body></html>');
	}
	
	function expect_callback() {
		pending_callbacks += 1;
	}

	function receive_callback() {
		pending_callbacks -= 1;
	}
	
	// create the server
	
	test_server = nerve.create([
		['/', function (req, res) {
			res.respond('Hello, World!');
		}],
		[get(/^\/get$/), function(req, res) {
			res.respond('GET matcher');
		}],
		[get('/getstring'), function(req, res) {
			res.respond('GET string matcher');
		}],
		[post('/poststring'), function(req, res) {
			res.respond('POST string matcher');
		}],
		[put('/putstring'), function(req, res) {
			res.respond('PUT string matcher');
		}],
		[del('/delstring'), function(req, res) {
			res.respond('DEL string matcher');
		}]
	]);
	test_server.serve();
	
	// test the server
	
	(function test_matched_request_string() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('GET', '/');
		expect_callback();
		req.finish(function (res) {
			test.assertEquals(200, res.statusCode);
			test.assertEquals('text/html', res.headers['content-type']);
			assert_response(res, 'Hello, World!');
		});
	}());
	
	(function test_unmatched_request_string() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('GET', '/unmatched');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_get_to_get_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('GET', '/get');
		expect_callback();
		req.finish(function (res) {
			test.assertEquals(200, res.statusCode);
			test.assertEquals('text/html', res.headers['content-type']);
			assert_response(res, 'GET matcher');
		});
	}());
	
	(function test_post_to_get_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('POST', '/get');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_put_to_get_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('PUT', '/get');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_delete_to_get_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('DELETE', '/get');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_get_to_get_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('GET', '/getstring');
		expect_callback();
		req.finish(function (res) {
			test.assertEquals(200, res.statusCode);
			test.assertEquals('text/html', res.headers['content-type']);
			assert_response(res, 'GET string matcher');
		});
	}());
	
	(function test_post_to_get_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('POST', '/getstring');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_put_to_get_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('PUT', '/getstring');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_delete_to_get_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('DELETE', '/getstring');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_nonmatching_get_to_get_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('GET', '/getstring2');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_post_to_post_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('POST', '/poststring');
		expect_callback();
		req.finish(function (res) {
			test.assertEquals(200, res.statusCode);
			test.assertEquals('text/html', res.headers['content-type']);
			assert_response(res, 'POST string matcher');
		});
	}());
	
	(function test_get_to_post_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('GET', '/poststring');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_put_to_post_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('PUT', '/poststring');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_delete_to_post_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('DELETE', '/poststring');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_nonmatching_post_to_post_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('POST', '/poststring2');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_put_to_put_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('PUT', '/putstring');
		expect_callback();
		req.finish(function (res) {
			test.assertEquals(200, res.statusCode);
			test.assertEquals('text/html', res.headers['content-type']);
			assert_response(res, 'PUT string matcher');
		});
	}());
	
	(function test_get_to_put_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('GET', '/putstring');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_post_to_put_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('POST', '/putstring');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_delete_to_put_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('DELETE', '/putstring');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_nonmatching_put_to_put_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('PUT', '/putstring2');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_del_to_del_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('DELETE', '/delstring');
		expect_callback();
		req.finish(function (res) {
			test.assertEquals(200, res.statusCode);
			test.assertEquals('text/html', res.headers['content-type']);
			assert_response(res, 'DEL string matcher');
		});
	}());
	
	(function test_get_to_del_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('GET', '/delstring');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_post_to_del_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('POST', '/delstring');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_put_to_del_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('PUT', '/delstring');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	(function test_nonmatching_del_to_del_string_matcher() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('DELETE', '/delstring2');
		expect_callback();
		req.finish(function (res) {
			assert_not_found(res);
		});
	}());
	
	// assert that all callbacks were called within the alloted time and exit
	
	setTimeout(function () {
		test.assertEquals(0, pending_callbacks);
		process.exit();
	}, 50);
}());
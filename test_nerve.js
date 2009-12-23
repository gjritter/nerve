/*global require, process, setTimeout */
'use strict';

(function () {
	var test = require('mjsunit'),
		http = require('http'),
		nerve = require('./nerve'),
		pending_callbacks = 0,
		test_server;
	
	function assert_response(response, expected_body, callback) {
		var body = '';
		response.addListener('body', function (chunk) {
			body += chunk;
		});
		response.addListener('complete', function () {
			test.assertEquals(expected_body, body);
		});
		callback();
	}
	
	function expect_callback() {
		pending_callbacks += 1;
	}

	function receive_callback() {
		pending_callbacks -= 1;
	}
	
	// create the server
	
	test_server = nerve.create([['/', function (req, res) {
		res.respond('Hello, World!');
	}]]);
	test_server.serve();
	
	// test the server
	
	(function test_matched_request_string() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('GET', '/');
		expect_callback();
		req.finish(function (res) {
			test.assertEquals(200, res.statusCode);
			test.assertEquals('text/html', res.headers['content-type']);
			assert_response(res, 'Hello, World!', function () {
				receive_callback();
			});
		});
	}());
	
	(function test_unmatched_request_string() {
		var client = http.createClient(8000, '127.0.0.1'),
			req = client.request('GET', '/unmatched');
		expect_callback();
		req.finish(function (res) {
			test.assertEquals(404, res.statusCode);
			test.assertEquals('text/html', res.headers['content-type']);
			assert_response(res, '<html><head><title>Not Found</title></head><body><h1>Not Found</h1></body></html>', function () {
				receive_callback();
			});
		});
	}());
	
	// assert that all callbacks were called within the alloted time and exit
	
	setTimeout(function () {
		test.assertEquals(0, pending_callbacks);
		process.exit();
	}, 50);
}());
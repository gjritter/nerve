/*global exports */
'use strict';

(function () {
	// the "URL and Filename safe" Base 64 Alphabet
	// see http://tools.ietf.org/html/rfc3548#section-4
	var id_characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

	exports.generate_id = function (length) {
		var id = '', i;
		for (i = 0; i < length; i += 1) {
			// choose a base 64 character using the low 6 bits of a random value
			// id += id_characters[0x3f & Math.floor(Math.random() * 0x100000000)];
			id += id_characters[Math.floor(Math.random() * id_characters.length)];
		}
		return id;
	};
}());
////////////////////////////////////////////////////////////////////////////////
// Loggerer
////////////////////////////////////////////////////////////////////////////////

// =============================================================================
// Settings
// =============================================================================

'use strict'

// Dependencies
const chalk = require('chalk');
let themes = require('./lib/themes.json');

// Configurable settings
let options = {
	theme      : 'one-dark',
  cache      : false,
  limit      : 299,
  timestamps : true,
	extensions : {
	 js    : ['js', 'json'],
	 image : ['tif', 'tiff', 'gif', 'jpeg', 'jpg', 'bmp', 'png', 'webp', 'svg'],
	 css   : ['sass', 'scss', 'css', 'less'],
	 html  : ['html', 'twig'],
	 php   : ['php'],
 }
};

let _logs = [];
let _legacy = [];
let _theme = themes[options.theme];

// =============================================================================
// Public Methods
// =============================================================================

module.exports           = log;
module.exports.get       = get;
module.exports.time      = time;
module.exports.clear     = clear;
module.exports.settings  = settings;
module.exports.legacy    = legacy;

// =============================================================================
// Define default settings
// =============================================================================

function settings(settings) {
  options = Object.assign(options, settings);
	if ( typeof options.theme == 'string' ) {
		_theme = themes[options.theme]
	}
}

// Return a timestamp ==========================================================

function time() {
	return `[${(new Date()).toTimeString().substr(0,8)}]`;
}

// Output all legacy logs ======================================================

function legacy(output = false) {
	if ( output ) {
		render(_legacy);
	}
	return _legacy;
}

function get() {
	return _logs;
}

// Empty the current log =======================================================

function clear() {

	// IF the legacy logs has too many elements, start shifting the first item on each clear.
	if (_legacy.length > options.limit) {
		_legacy.shift()
	}

	_legacy.push(_logs)

	_logs = []

}

// Manage a log ================================================================

function log(...args) {

	if (!args) { return false }

	// Arguments passed as an object

	if ( typeof args[0] == 'object') {

		var {type = null, file = null, note = null, cache = null, timestamp = null, theme = []} = args[0]

	} else {

		// Maange Arguments

		var messages  = [],
				cache     = null,
				timestamp = null,
				theme     = [];

		args.forEach(arg => {
			switch(typeof(arg)) {
				case 'boolean':
					if      ( cache == null ) { cache = arg }
					else if ( timestamp == null ) { timestamp = arg }
				break;
				case 'object':
					if ( theme.length == 0 ) {
						theme = { 'colours' : arg }
						// theme = arg
					}
				case 'string':
					if ( Object.keys(themes).includes(arg) ) {
						theme = arg
					} else if ( typeof arg == 'string') {
						messages.push(arg)
					}
				break;
			}
		})
	}

	if (!messages.length) {
		return false;
	}

	// Booleans fallback

	if ( cache == null ) { cache = options.cache }
	if ( timestamp == null ) { timestamp = options.timestamps }
	if ( theme.length == 0 ) { theme = options.theme }

	timestamp = timestamp ? time() : `!${time()}`;

	// Prepare output data for a few potential options...

	let output = {
		'messages'  : messages,
		'cache'     : cache,
		'timestamp' : timestamp,
		'theme'     : theme
	}

	// Store the log data

	_logs.push(output);
	_legacy.push(output);

	// If caching is off, render out the output immediately

	if ( cache == false ) {
		render([output])
	}

	// Return the output, just for fun.

	return output;

}

// =============================================================================
// Private Methods
// =============================================================================

function render(logs = _logs) {

	if (!logs.length) { return false }

	let regex = /(?:\.([^.]+))?$/;

	logs.forEach(log => {

		// console.log(log);

		let lengths = log.messages.map(message => message.length);
		let results = log.timestamp.charAt() == '!' ? '' : log.timestamp + ' ';
		let theme = null;

		// Theme management ========================================================

		if ( typeof log.theme == 'string' && Object.keys(themes).includes(log.theme) ) {
			theme = themes[log.theme];
		} else if (typeof log.theme == 'object') {

			// Clone the default theme
			let clone = Object.assign({}, _theme);

			if (Object.keys(log.theme).length == 1 && typeof log.theme['colours'] !== 'undefined') {
				// If the theme was set with just an array of colours, merge the remaining
				// theme properties with the default one.
				clone['colours'] = log.theme['colours'];
			}

			theme = clone;

		} else {
			theme = Object.assign({}, _theme);
		}

		// Message management ======================================================

		log.messages.forEach((message, index) => {

			// File type chcker ------------------------------------------------------

			// Check if message has a file extension
			let extension = regex.exec(message)[1];
			let colour = theme.colours[index] || false;

			if ( typeof extension !== 'undefined') {

				// Determine what category the extension fits into and return in the extensions index
				let index = Object.values(options.extensions).findIndex(element => {
					return element.includes(extension);
				})
				// Use the index get the category name
				let key = Object.keys(options.extensions)[index];

				if ( Object.keys(theme.files).includes(key) ) {
					results = results + stylise(message, theme.files[key]) + ' ';
				} else {
					results = results + stylise(message, colour) + ' ';
				}
			}

			// Keyword checker -------------------------------------------------------

			else if ( Object.keys(theme.keywords).includes(message) ) {
				results = results + stylise(message + ': ', theme.keywords[message]);
			}

			// Defualt ---------------------------------------------------------------

			else {
				results = results + stylise(message, colour) + ' ';
			}

		})

		if ( results !== '') {

			console.log(results);

		}

	// 	// var longest = befores.reduce(function (a, b) { return a.length > b.length ? a : b; });
	//
	// 	// Object.entries(item).forEach(([key, value]) => {
	//
	//
	// 	//
	// 	// 	console.log(data);
	// 	//
	// 		let log = `${timestamp}${type}${file}${note}`
	// 	//
	// 		console.log(_log)
	// 	//
	// 	// })
	//
	})
}

function stylise(message, colour) {
	if ( colour ) {
		return chalk.hex(colour)(message);
	} else {
		return message;
	}
}

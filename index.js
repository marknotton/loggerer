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
  space      : true,
  spacer     : ' ',
  seperator  : ' ',
  suffix     : ':',
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
module.exports.render    = render;
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

	console.log('logs cleared');

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

// Calculate spacers to words ==================================================

function spacers(logs) {

	let matrix = []

	logs.forEach(log => {
		matrix.push(log.messages.map(message => message.length));
	})

	let longestArray = matrix[matrix.reduce((p, c, i, a) => a[p].length > c.length ? p : i, 0)].length;

	let longests = [];
	let botrix = [];

	for(let i = 0 ; i < longestArray; i++){
		let ggg = [];
	  matrix.forEach(mat => {
			ggg.push(mat[i] || 0)
		})
		var longest = ggg.reduce((a, b) => a > b ? a : b)
		longests.push(longest)
		// botrix.push(ggg)
	}

	matrix.forEach(mat => {
		let hhh = mat.map((a, i) => longests[i] - a)
		botrix.push(hhh)
	})

	// console.log(botrix)
	// console.log(matrix)
	// console.log(longests)

	// var longest = befores.reduce(function (a, b) { return a.length > b.length ? a : b; });

	let result = botrix;

	return result;

}

// Render out the logs =========================================================

function render(logs = _logs, clearAfterRender = false) {

	// If the first argument is a boolean and is true,
	// define the ClearAfterRender to true and use the global _logs
	if ( typeof logs == 'boolean' && logs === true ) {
		logs = _logs;
		clearAfterRender = true;
	}

	if (!logs.length) { return false }

	if ( options.space && options.cache == true ) {
		var spaces = spacers(logs);
	}


	logs.forEach((log, i) => {

		let results = log.timestamp.charAt() == '!' ? '' : log.timestamp + options.seperator;
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
		let s = spaces[i];

		log.messages.forEach((message, index) => {


			// File type chcker ------------------------------------------------------

			// Check if message has a file extension
			let extension = /(?:\.([^.]+))?$/.exec(message)[1];
			let colour = theme.colours[index] || false;

			if ( typeof extension !== 'undefined') {

				// Determine what category the extension fits into and return in the extensions index
				let index = Object.values(options.extensions).findIndex(element => {
					return element.includes(extension);
				})
				// Use the index get the category name
				let key = Object.keys(options.extensions)[index];

				if ( Object.keys(theme.files).includes(key) ) {
					results = results + stylise(message, theme.files[key])// + options.seperator;
				} else {
					results = results + stylise(message, colour)// + options.seperator;
				}
			}

			// Keyword checker -------------------------------------------------------

			else if ( Object.keys(theme.keywords).includes(message) ) {
				results = results + stylise(message + options.suffix, theme.keywords[message])// + options.seperator;
			}

			// Defualt ---------------------------------------------------------------

			else {
				results = results + stylise(message, colour)// + options.seperator;
			}


			// let amount = s[index];
			let amount = parseInt(s[index]);
			amount = amount < 1 ? 0 : amount/options.spacer.length;
			results = results + options.spacer.repeat(amount) + (index + 1 != log.messages.length ? options.seperator : '');

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

	if ( clearAfterRender ) {
		clear()
	}

}

// Manage the styling ==========================================================

const regexes = {
	rgb     : /^rgb[(](?:\s*0*(?:\d\d?(?:\.\d+)?(?:\s*%)?|\.\d+\s*%|100(?:\.0*)?\s*%|(?:1\d\d|2[0-4]\d|25[0-5])(?:\.\d+)?)\s*(?:,(?![)])|(?=[)]))){3}[)]$/g,
	hex     : /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i,
	keyword : /black|red|green|yellow|blue|magenta|cyan|white|gray|redBright|greenBright|yellowBright|blueBright|magentaBright|cyanBright|whiteBright/g,
	hsl     : /^hsl[(]\s*0*(?:[12]?\d{1,2}|3(?:[0-5]\d|60))\s*(?:\s*,\s*0*(?:\d\d?(?:\.\d+)?\s*%|\.\d+\s*%|100(?:\.0*)?\s*%)){2}\s*[)]$/g,
}

function stylise(message, colour) {

	if ( colour ) {

		let type = null;

		Object.values(regexes).forEach((regex, index) => {
			if (regex.test(colour)) {
				type = Object.keys(regexes)[index];
			}
		})

		switch (type) {
	    case 'keyword':
        message = chalk[colour](message)
      break;
	    case 'rgb':
				var match = /rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/.exec(colour);
				if (match !== null) {
					message = chalk.rgb(match[1], match[2], match[3])(message);
				}
      break;
	    case 'hex':
        message = chalk.hex(colour)(message);
      break;
	    case 'hsl':
				var match = /hsl\((\d{1,3}), (\d{1,3}), (\d{1,3})\)/.exec(colour);
				if (match !== null) {
					message = chalk.hsl(match[1], match[2], match[3])(message);
				}
      break;
		}

	}

	return message;
}

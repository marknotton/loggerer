////////////////////////////////////////////////////////////////////////////////
// Loggerer
////////////////////////////////////////////////////////////////////////////////

// =============================================================================
// Settings
// =============================================================================

'use strict'

// Dependencies
const chalk = require('chalk');

let logs = [];
let legacy = [];

// Configurable Options
var defaults = {
  cache : false,
  limit : 299,
  timestamps : true,
};

// =============================================================================
// Themes
// =============================================================================

let themes = {
	default : ['#61AEEF', '#91C379', '#708284']
}

let types = {
	created  : '#F0DB4F',
	updated  : '#7DB704',
	skipped  : '#E6A41F',
	deleted  : '#E06859',
	complete : '#61AEEF',
}

let files = {
	js    : '#7DB704',
	image : '#F0DB4F',
	css   : '#C76395',
	html  : '#E6A41F',
	php   : '#5737A4',
}

// =============================================================================
// File tu[es]
// =============================================================================

const extensions = {
	js    : ['js', 'json'],
	image : ['tif', 'tiff', 'gif', 'jpeg', 'jpg', 'bmp', 'png', 'webp', 'svg'],
	css   : ['sass', 'scss', 'css', 'less'],
	html  : ['html', 'twig'],
	php   : ['php'],
}

// =============================================================================
// Public Methods
// =============================================================================

module.exports           = log;
module.exports.timestamp = timestamp;
module.exports.clear     = clear;
// module.exports.legacy    = legacy;

// Return a timestamp ==========================================================

function timestamp() {
	return `[${(new Date()).toTimeString().substr(0,8)}]`;
}

// Output all legacy logs ======================================================

// function legacy() {
// 	render(legacy);
// }

// Empty the current log =======================================================

function clear() {

	// IF the legacy logs has too many elements, start shifting the first item on each clear.
	if (legacy.length > defaults.limit) {
		legacy.shift()
	}

	legacy.push(logs)

	logs = []

}

// Manage a log ================================================================

function log(...args) {

	if (!args) { return false }

	let _type      = null,
			_file      = null,
			_note      = null,
			_theme     = [],
			_cache     = defaults.cache,
			_timestamp = defaults.timestamps;

	args.forEach(arg => {
		switch(typeof arg) {
			case 'boolean':
				if      ( !_cache ) { _cache = arg }
				else if ( !_timestamp ) { _timestamp = arg }
			break;
			case 'array':
				if      ( !_type )  { _type = arg[0]; _theme.push(arg[1]) }
				else if ( !_file )  { _file = arg[0]; _theme.push(arg[1]) }
				else if ( !_note )  { _note = arg[0]; _theme.push(arg[1]) }
				else if ( !_theme ) { _theme = arg }
			case 'string':
				if ( Object.keys(themes).includes(arg) ) {
					_theme = themes[arg];
				} else {
					if      ( !_type )  { _type = arg }
					else if ( !_file )  { _file = arg }
					else if ( !_note )  { _note = arg }
				}
			break;
		}
	})

	if ( !_theme.length ) {

		if ( _type ) {
			let key = _type.replace(/\s+/g, '-').toLowerCase();
			if ( Object.keys(types).includes(key) ) {
				_theme.push(types[key])
			}
		}

		if ( _file ) {
			let regex = /(?:\.([^.]+))?$/;
			let extension = regex.exec(_file)[1];
			let index = Object.values(extensions).findIndex(element => {
				return element.includes(extension);
			})
			let key = Object.keys(extensions)[index];
			if ( Object.keys(files).includes(key) ) {
				_theme.push(files[key])
			}
		}

		// if ( _note ) {
		// 	_theme.push(types[key])
		// }
	}

	// Make sure the theme has exactly 3 colours.

	switch(_theme.length) {
		case 0:
			_theme = themes.default;
		break;
		case 1:
			_theme = [ _theme[0], themes.default[1], themes.default[2] ]
		break;
		case 2:
			_theme = [ _theme[0], _theme[1], themes.default[2] ]
		break;
	}

	// Add a ! marker to the timestamp if it shouldn't be rendered. But we'll store it anyway

	_timestamp = _timestamp ? timestamp() : `!${timestamp()}`

	// Prepare the output that will be both rendered out or stored

	let output = {
		type      : _type,
		file      : _file,
		note      : _note,
		theme     : _theme,
		timestamp : _timestamp
	}

	// Store the log data

	logs.push(output)

	// If caching is off, render out the output immediately

	if (!_cache) {
		render([output])
	}

	// Return the output, just for fun.

	return output;

}

// =============================================================================
// Private Methods
// =============================================================================

function render(items = logs) {

	if (!items.length) { return false }

	items.forEach(item => {

		let timestamp = item.timestamp ? chalk.hex(item.theme[2])(item.timestamp) + ' ' : '';
		let type      = item.type      ? chalk.hex(item.theme[0])(item.type + ': ')     : '';
		let file      = item.file      ? chalk.hex(item.theme[1])(item.file) + ' '      : '';
		let note      = item.note      ? chalk.hex('- ' + item.theme[2])(item.note)     : '';

		// var longest = befores.reduce(function (a, b) { return a.length > b.length ? a : b; });

		// Object.entries(item).forEach(([key, value]) => {


		//
		// 	console.log(data);
		//
			let log = `${timestamp}${type}${file}${note}`
		//
			console.log(log)
		//
		// })

	})

	// let key = arg[1].replace(/\s+/g, '-').toLowerCase();
	// if ( Object.keys(types).includes(key) ) {
	// 	_theme.push(types[key])
	// } else {
	// 	_theme.push(arg[1])
	// }

}

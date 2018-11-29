# Lumberjack

![Made For NPM](https://img.shields.io/badge/Made%20for-NPM-orange.svg)

CLI console logger, with some caching and theming options

![enter image description here](https://i.imgur.com/uaRWd0i.jpg)

## Installation
```
npm i @marknotton/lumberjack --save-dev
```
```js
const log = require('@marknotton/lumberjack');
```

## Usage

Basic example:
```js
log('The quick brown fox jumps over the lazy dog')
```
Basic CLI output:
```
[12.31.11] The quick brown fox jumps over the lazy dog
```

Lumberjack will accept any number of parameters (segments). Different segments can adjust settings and theming preferences on-the-fly.

## Options
| Option | Default | Type | Description
|--|--|--|--
| theme      | 'one-dark' | String/Array | You can choose a predefined theme "atom-dark", "atom-light", "base16-dark", "base16-light", "one-dark", "one-light", "solarized-dark", "solarized-light". Or pass in your own as an associate array. See below for more information. Yes, these are referenced from Atoms own default theme library.
| cache      | true | Boolean | This will cache all your logs and not actually output anything into your CLI until you run the render() function. Setting this to `false` will output logs immediately.
| limit      | 299 | Number | Despite clearing the logs. Legacy logs are never deleted. If the this limit is reached, logs will be shifted and the oldest logs will be deleted permanently.
| timestamps | true | Boolean | Omit timestamps from your logs. Timestamps will still be stored in your legacy cache.
| delay | 300 | Number | Delay the amount of time (in milliseconds) that the rendering should take before logging out messages. This helps to keep all the logs at the bottom of your CLI, skipping all the other gumph that might be thrown out.
| separator  | ' ' | String | Each log segment will be separated with this string.
| suffix     | ':' | String | Keywords will be suffixed with this string.
| spacer     | '-' (x80) | String | Spacers will output a decorative line at the start of each new render.
| extensions | See below | Object | You may want to introduction new file types for more theming options.

## Defining your default settings

You can define all your Lumberjack settings to be referenced by all instances globally.
```
log.settings({
  theme : 'atom-light',
  cache : false,
  seperator : ’ - ’
  ...
});
```

### File Extensions

If an segments string ends with a file extension matching one of these groups, then the relative text colour will be applied to that section of the log. See theming.

	extensions : {
	 js    : ['js', 'json'],
	 image : ['tif', 'tiff', 'gif', 'jpeg', 'jpg', 'bmp', 'png', 'webp', 'svg'],
	 css   : ['sass', 'scss', 'css', 'less'],
	 html  : ['html', 'twig'],
	 php   : ['php'],
 }

### Keywords

If an segments string contains a keyword (case sensitive) from the 'keywords' theme group, then the relative text colour will be applied to that section of the log. See theming below.

```js
log("Deleted", "/assets/images/logo.jpg", "and there's nothing you can do about it!")
```
The log segment "Deleted" matches a predefined keyword and will be output with a different colour to the rest of the log.

### Theming

You can create your own themes. They must follow this format:
```js
"theme-name" : {
	"colours" : ["#5DAEEF", "#C573BD"],
	"keywords" : {
		"Created"  : "#F0DB4F",
		"Updated"  : "#7DB704",
		"Skipped"  : "#E6A41F",
		"Deleted"  : "#E06859",
		"Complete" : "#61AEEF"
	},
	"files" : {
		"js"    : "#7DB704",
		"image" : "#F0DB4F",
		"css"   : "#C76395",
		"html"  : "#E6A41F",
		"php"   : "#5737A4"
	}
}
```

For every log segment a different text colour will be used depending on the themes colours array. If you have more segments than colours, no theme colour is applied. Theme colours are ignored if the string matches a keyword or file type.  

Lumberjack is using [Chalk](https://www.npmjs.com/package/chalk) in the background. So you can use colours in the following formats rgb, hex, keywords or hsl.

Timestamps are not themeable.

## Log

The log function will take into account a few special parameters to supersede any global/default settings.

All strings will be cached as log messages, unless it matches a theme name exactly. See the list of available theme names above. If a theme name is found, it will alter the theming for this specific log only.

Alternatively you can pass in an array of colours which will merge into the existing themes colour array.

There are also two booleans you can use. The first will enable/disable caching or outputting the log immediately. The second will omit the timestamp if false.

#### Examples:

```js
log('Completed', 'All tasks are complete', 'foobar')
```
![Log 1](https://i.imgur.com/QiWvNu2.jpg)
---
```js
log('Completed', 'All tasks are complete', 'foobar', true, false)
```
![Log 2](https://i.imgur.com/4qJ7btZ.jpg)
--
```js
log('Completed', 'All tasks are complete', 'foobar', 'solarized-dark')
```
![Log 3](https://i.imgur.com/JlcMQEL.jpg)
--
```js
log('Completed', 'All tasks are complete', 'foobar', ['red', '#1CA0F1', 'white'])
```
![Log 1](https://i.imgur.com/996VbVF.jpg)

Remember to render your logs, or disable caching to have them display immediately.
## Render

Output all cached logs. Timestamps are relative to the time they were stored, not at the time this render function is called.

```js
log.render()
```

You can pass in your own array of logs to be rendered out. By default, this will clear your log cache. Unless you pass in a `false` boolean.

Lumberjack was initially designed to work with Gulp tasks to keep all the important logs at the end of your CLI after running a task. The idea is to avoid all your manually defined logs from being scattered all over the place with something like this:

```js
return gulp.src([...])
  .pipe(gulp.dest(js))
  .on('end', () => log.render())
```

## Clear

Clear the log cache manually. All logs are saved into the legacy cache before being cleared.
```js
log.clear()
```

## Time

This just returns a timestamp in the same format used elsewhere
```js
log.time()
```
Returns something like this ```[12:30:11]```

## Legacy

All logs are stored in the Legacy cache regardless of wether caching is on or not. This is limited to the amount set in the options. This function will return all the legacy logs as an array.
```js
log.legacy()
```
Passing in `true`  will render all of the legacy logs in one go.

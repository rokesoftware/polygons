//roke namespace
var roke = roke || {};

//define packages
roke.polygons = roke.polygons || {};

/**
 * Extend an object (mimics jQuery.extend() funcionality).
 * 
 * @param {object} [arg1] An object to be extended.
 * @param {object...} [args] Objects extending the first object.
 * @returns {object} Extended object.
 */
roke.extend = function() {
	for (var i = 1; i < arguments.length; i++) {
		for (var key in arguments[i]) {
			if (arguments[i].hasOwnProperty(key)) {
				arguments[0][key] = arguments[i][key];
			}
		}
	}
	return arguments[0];
};
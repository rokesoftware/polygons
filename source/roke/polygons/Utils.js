var Utils = {
	/**
	 * Get distance between any two points.
	 * 
	 * @param {LatLng} p1
	 * @param {LatLng} p2
	 * @returns {number} Distance.
	 */
	getDistance: function(p1, p2) {
		var x = Math.abs(p1.lat() - p2.lat()),
			y = Math.abs(p1.lng() - p2.lng());
		return Math.sqrt(x * x + y * y);
	},
	/**
	 * Normalize position ([lat,lng] to LatLng).
	 * 
	 * @param {LatLng|Array} position
	 * @returns {LatLng}
	 */
	normalizePosition: function(position) {
		if (position instanceof google.maps.LatLng) {
			return position;
		} else if (position instanceof Array) {
			return new google.maps.LatLng(position[0], position[1]);
		}
	},
	/**
	 * Get the MouseEvent object from the given Google Maps event object.
	 * 
	 * As mentioned in the following StackOverflow comment
	 * http://stackoverflow.com/questions/15775741/get-pagex-and-pagey-from-google-maps-mouseover#comment22574193_15781227,
	 * the name of the property of event containing the MouseEvent object
	 * changes with API versions. The most reliable way to access it is
	 * therefore to iterate over the entire event and find the MouseEvent
	 * object manually. 
	 * 
	 * @param {Google Maps event} event Google Maps event to extract the
	 *				MouseEvent object from.
	 * @returns {MouseEvent} MouseEvent object.
	 */

	getMouseEventObject: function(event) {
		var mouseEvent = null;
		for (key in event) {
			//Firefox can't resolve `constructor.name`, use `toString` as below
			if (event[key] !== undefined && (event[key].constructor.name === 'MouseEvent') || (event[key].constructor.toString() === '[object MouseEvent]') || (event[key].constructor.toString() === '[object MouseEventConstructor]') || (event[key].constructor.toString() === '[object Event]')) {
				mouseEvent = event[key];
				break;
			}
		}
		return mouseEvent;
	}
};
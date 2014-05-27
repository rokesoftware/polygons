var Utils ={
	/**
	 * Get distance between any two points.
	 * 
	 * @param {LatLng} p1
	 * @param {LatLng} p2
	 * @returns {number} Distance.
	 */
	getDistance : function(p1, p2) {
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
	normalizePosition : function(position) {
		if (position instanceof google.maps.LatLng) {
			return position;
		} else if (position instanceof Array) {
			return new google.maps.LatLng(position[0], position[1]);
		}
	}
}
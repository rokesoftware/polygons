/**
 * Extend google.maps.Polygon.
 */

(function() {
	var Polygon = Class.extend(google.maps.Polygon, false).extend({
		/**
		 * Constructor.
		 * 
		 * @returns {roke.polygons.Polygon}
		 */
		init: function() {
			//call the parent constructor with some defaults
			arguments[0] = roke.extend({}, Polygon.defaults, arguments[0]);
			this._super('init', arguments);

			// markers and shadow markers for the polygon
			this.markers = [];
			this.shadows = [];

			//register event listeners
			google.maps.event.addListener(this, 'click', this.select);

			return this;
		},
		/**
		 * Get polygon coordinates.
		 * 
		 * @returns {Array} An array of google.maps.LatLng.
		 */
		getCoords: function() {
			//return this.getPath().getArray();
			var coords = [];
			var c = this.getPath().getArray();
			for (var i in c) {
				coords.push([c[i].lat(), c[i].lng()])
			}
			return coords;
		},
		/**
		 * Select this polygon.
		 *   
		 * @returns {roke.polygons.Polygon}
		 */
		select: function() {
			this.map.selectPolygon(this);

			return this;
		},
		/**
		 * Set state of this polygon (states are defined in the defaults).
		 * 
		 * @param {String} state
		 * @returns {roke.polygons.Polygon}
		 */
		setState: function(state, options) {
			return this.states[state].call(this, options);
		},
		/**
		 * Add a point to the polygon.
		 * 
		 * @param {google.maps.LatLng|Array} position
		 * @param {int} index
		 * @param {roke.polygons.Marker} marker
		 * @returns {roke.polygons.Polygon}
		 */
		addPoint: function(position, index, marker) {
			var path = this.getPath();
			index = parseInt(index || path.length);

			path.insertAt(index, Utils.normalizePosition(position));
			this.insertMarker(index, marker);

			return this;
		},
		/**
		 * Remove point from the polygon.
		 * 
		 * @param {int} index
		 * @returns {roke.polygons.Polygon}
		 */
		removePoint: function(index) {
			var marker = this.markers[index];

			//unsnap all the markers snapped to this
			marker.unsnapAll();
			marker.setMap(null);

			//remove the point and the marker
			this.getPath().removeAt(index);
			this.markers.splice(index, 1);

			//remove the polygon as well if it has no points
			if (!this.markers.length) {
				this.remove();
			}
			else {
				this.normalizeShadows();
				this.updateIndexes();
			}

			return this;
		},
		/**
		 * Set the point position.
		 * 
		 * @param {int} index
		 * @param {google.maps.LatLng|Array} position
		 * @returns {roke.polygons.Polygon}
		 */
		setPoint: function(index, position) {
			position = Utils.normalizePosition(position);
			this.markers[index].setPosition(position);
			this.getPath().setAt(index, position);

			return this;
		},
		/**
		 * Insert marker at the given index.
		 * 
		 * @param {number} index
		 * @param {roke.polygons.Marker} [marker] Marker to be inserted (useful when transforming shadows into markers). If undefined, a new marker is created.
		 * @returns {roke.polygons.Polygon}
		 */
		insertMarker: function(index, marker) {
			var point = this.getPath().getAt(index);

			//create a new marker or use the given one
			marker = marker || new roke.polygons.Marker({
				position: new google.maps.LatLng(point.lat(), point.lng()),
				map: this.map,
				polygon: this
			});

			// add the marker to the polygon's markers' array
			this.markers.splice(index, 0, marker);
			this.updateIndexes();

			//insert a shadow marker
			this.normalizeShadows();

			return this;
		},
		/**
		 * Update marker indexes.
		 * 
		 * @returns {roke.polygons.Polygon}
		 */
		updateIndexes: function() {
			for (var i in this.markers) {
				this.markers[i].setIndex(i);
			}

			return this;
		},
		/**
		 * Normalize shadow markers.
		 * 
		 * @returns {roke.polygons.Polygon}
		 */
		normalizeShadows: function() {
			var size = this.markers.length;

			//remove old shadows
			for (var i in this.shadows) {
				//might have been changed into a normal marker
				if (this.shadows[i].isShadow()) {
					this.shadows[i].remove();
				}
			}
			this.shadows = [];

			//create shadows
			if (size > 2) {
				for (var i in this.markers) {
					i = parseInt(i);
					var prev = this.markers[i];

					var next;
					//last -> the next one is the first marker
					if (size - 1 === i) {
						next = this.markers[0];
					}
					else {
						next = this.markers[i + 1];
					}

					var shadowPosition = this.getShadowPosition(prev, next);
					var shadow = new roke.polygons.Marker({
						position: new google.maps.LatLng(shadowPosition.lat, shadowPosition.lng),
						map: this.map,
						polygon: this,
						prev: prev,
						next: next,
						shadow: true
					});
					this.shadows.push(shadow);

					//save shadows to the markers
					prev.shadowNext = shadow;
					next.shadowPrev = shadow;
				}
			}

			return this;
		},
		/**
		 * Get position of a shadow for the given markers.
		 * 
		 * @param {Marker} prev
		 * @param {Marker} next
		 * @returns {Polygon}
		 */
		getShadowPosition: function(prev, next) {
			prev = prev.getPosition();
			next = next.getPosition();
			return {
				lat: next.lat() - (next.lat() - prev.lat()) / 2,
				lng: next.lng() - (next.lng() - prev.lng()) / 2
			};
		},
		/**
		 * Set zIndex for the polygon and its markers.
		 * 
		 * @param {number} zIndex
		 * @returns {Polygon}
		 */
		setZIndex: function(zIndex) {
			this.zIndex = zIndex;
			for (var i in this.markers) {
				this.markers[i].setZIndex(zIndex);
			}

			return this;
		},
		/**
		 * Remove the polygon.
		 * 
		 * @returns {Polygon}
		 */
		remove: function() {
			return this.map.removePolygon(this);
		}
	});

	Polygon.defaults = {
		strokeWeight: 3,
		fillColor: '#5555FF',
		states: {
			'default': function() {
				this.setOptions({
					fillColor: "#55f"
				});
				this.setZIndex(0);
			},
			'selected': function() {
				this.setOptions({
					fillColor: "#ff0"
				});
				this.setZIndex(1);
			},
			'error': function() {
				this.setOptions({
					fillColor: "#f00"
				});
				this.setZIndex(0);
			}
		}
	};

	roke.polygons.Polygon = Polygon;
})();
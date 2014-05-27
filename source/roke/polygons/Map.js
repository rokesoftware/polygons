(function() {
	/**
	 * Extend google.maps.Map.
	 */
	var Map = Class.extend(google.maps.Map, false).extend({
		/**
		 * Constructor.
		 * 
		 * @returns {Map}
		 */
		init: function() {
			//call the parent constructor with some defaults
			arguments[1] = roke.extend({}, Map.defaults, arguments[1]);
			this._super('init', arguments);

			// register event listeners on the map
			google.maps.event.addListener(this, 'click', function(e) {
				if (!this.isDrawing()) {
					this.selectPolygon(this.addPolygon());
				}
				this.addPoint(this.selectedPolygon, e.latLng);
			});
			google.maps.event.addListener(this, 'rightclick', function(){
				this.stopDrawing();
			});
			google.maps.event.addListener(this, 'zoom_changed', function(e) {
				this.calculateDistanceFactor();
			});

			// polygons
			this.polygons = [];
			
			//init distance factor
			this.calculateDistanceFactor();
			
			return this;
		},
		/**
		 * Get distance affected by the current zoom.
		 * 
		 * @param {type} distance Distance at the base zoom.
		 * @returns {number} Real distance at the current zoom.
		 */
		getRealDistance: function(distance){
			return distance / this.distanceFactor;
		},
		/**
		 * Calculate how much is the distance affected by the current zoom.
		 * 
		 * @returns {number} Distance factor.
		 */
		calculateDistanceFactor: function(){
			this.distanceFactor = Math.pow(2, this.getZoom() - this.baseZoom);
			return this.distanceFactor;
		},
		/**
		 * Get all the polygons in the map.
		 * 
		 * @returns {Array} An array of all the polygons this map contains.
		 */
		getPolygons: function() {
			return this.polygons;
		},
		/**
		 * Get the selected polygon.
		 * 
		 * @returns {Polygon}
		 */
		getSelectedPolygon: function() {
			return this.selectedPolygon;
		},
		/**
		 * Add polygon given by the path to the map.
		 * 
		 * @param {object} options
		 * @returns {Polygon}
		 */
		addPolygon: function(options) {
			options = roke.extend({
				map: this
			}, options);
			var path = options.path || [];
			options.path = new google.maps.MVCArray([]);
			
			//create the polygon and add it to the array
			var polygon = new roke.polygons.Polygon(options);
			this.polygons.push(polygon);
			
			//add points (if any)
			for(var i in path){
				polygon.addPoint(path[i]);
			}
			
			google.maps.event.trigger(this, 'polygonAdd', polygon);
			return polygon;
		},
		/**
		 * Remove given polygon from the map.
		 * 
		 * @param {Polygon} polygon
		 * @returns {Polygon}
		 */
		removePolygon: function(polygon){
			//remove all the points
			while (polygon.getPath().length > 0) {
				polygon.removePoint(0);
			}

			//remove the polygon
			polygon.setMap(null);
			for(var i in this.polygons){
				if(this.polygons[i] === polygon){
					this.polygons.splice(i,1);
				}
			};
			
			//this polygon is selected -> unselect it
			if(this.getSelectedPolygon() === polygon){
				this.selectPolygon(null);
			}
			
			google.maps.event.trigger(this, 'polygonRemove', polygon);
			return polygon;
		},
		/**
		 * Select given polygon.
		 * 
		 * @param {Polygon} polygon
		 * @returns {Map}
		 */
		selectPolygon: function(polygon) {
			this.selectedPolygon = null;
			for (var i in this.polygons) {
				if (this.polygons[i] === polygon) {
					polygon.setState('selected');
					this.selectedPolygon = polygon;
				} else {
					this.polygons[i].setState('default');
				}
			}
			
			return this;
		},
		/**
		 * Add a point to the given polygon.
		 * 
		 * @param {Polygon} polygon
		 * @param {LatLng|Array} position
		 * @returns {Map}
		 */
		addPoint: function(polygon, position) {
			polygon.addPoint(position);
			return this;
		},
		/**
		 * Stop drawing (=unselect polygons).
		 * 
		 * @returns {Map}
		 */ 
		stopDrawing: function() {
			this.selectPolygon(null);
			return this;
		},
		/**
		 * Are we currently in the drawing mode?
		 * 
		 * @returns {boolean}
		 */
		isDrawing: function() {
			return this.selectedPolygon !== null && this.selectedPolygon !== undefined;
		},
		/**
		 * Clear the map (remove all polygons).
		 * 
		 * @returns {Map}
		 */
		clear: function() {
			while(this.polygons.length){
				this.polygons[0].remove();
			}
			return this;
		},
		/**
		 * Snap loaded polygons' markers properly from the start.
		 * 
		 * @returns {Map}
		 */
		initSnapping: function() {
			//get all the markers
			var markers = [];
			for (var i in this.polygons) {
				markers = markers.concat(this.polygons[i].markers);
			}

			//loop through all the markers and check snapping
			for (var i in markers) {
				var current = markers[i];
				current.updateSnapTargets();
				current.checkSnapping(true);
			}
			
			return this;
		}
	});

	Map.defaults = {
		//serves as the base zoom for the calculation of the distance factor
		baseZoom: 10
	};

	roke.polygons.Map = Map;
})();
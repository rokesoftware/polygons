/**
 * Extends google.maps.Marker.
 */

(function() {
	var Marker = Class.extend(google.maps.Marker, false).extend({
		/**
		 * Constructor.
		 * 
		 * @returns {Marker}
		 */
		init: function() {
			//call the parent constructor with some defaults
			arguments[0] = roke.extend({}, Marker.defaults, arguments[0]);
			this._super('init', arguments);
			
			if(this.isShadow()){
					this.setOpacity(0.3);
			}
			
			//initially snapped to nothing
			this.snappedTo = [];

			//remove the marker on right click
			google.maps.event.addListener(this, 'rightclick', function(e) {
				if (!this.isShadow()) {
					this.remove();
				}
			});

			//select the corresponding polygon on left click
			google.maps.event.addListener(this, 'click', function(e) {
				this.polygon.select();
			});
			
			
			google.maps.event.addListener(this, 'mousedown', function(e) {
				this.ctrlKey = Utils.getMouseEventObject(e).ctrlKey;
			});
			google.maps.event.addListener(this, 'mouseup', function(e) {
				this.ctrlKey = false;
			});

			google.maps.event.addListener(this, 'dragstart', function(e) {
				if(this.ctrlKey){
					this.unsnapAll();
				}
				
				this.prepareMove(e.latLng);
			});

			google.maps.event.addListener(this, 'drag', function(e) {
				this.move(e.latLng);
			});

			google.maps.event.addListener(this, 'dragend', function(e) {
				this.finishMove();
			});

			return this;
		},
		/**
		 * Prepare the marker for the move.
		 * 
		 * @param {LatLng|Array} position 
		 * @param {boolean} [propagate=true] If set to true, snapped markers are prepared along with this one.
		 * @returns {roke.polygons.Marker}
		 */
		prepareMove: function(position, propagate) {
			position = Utils.normalizePosition(position);
			propagate = propagate === undefined ? true : propagate;
			
			//if this is a shadow marker, convert it to a normal one
			if (this.isShadow()) {
				var index = this.next.index;

				//remove shadow features and behaviour
				this.shadow = false;
				this.prev = null;
				this.next = null;
				this.setOpacity(1);

				//add normal behaviour
				this.polygon.addPoint(position, index, this);
			}
			
			// prepare all the snapped markers as well
			if (propagate) {
				for (var i in this.snappedTo) {
					this.snappedTo[i].prepareMove(position, false);
				}
			}
			
			this.updateSnapTargets();
		},
		/**
		 * Move the marker.
		 * 
		 * @param {LatLng|Array} position 
		 * @param {boolean} [propagate=true] If set to true, snapped markers are dragged along with this one.
		 * @returns {roke.polygons.Marker}
		 */
		move: function(position, propagate) {
			position = Utils.normalizePosition(position);
			propagate = propagate === undefined ? true : propagate;

			if (propagate) {
				// drag all the snapped markers as well
				for (var i in this.snappedTo) {
					this.snappedTo[i].move(position, false);
				}
			}
			
			//set the position of this marker and the corresponding point
			this.setPosition(position);
			this.polygon.getPath().setAt(this.index, position);

			// check snapping
			this.checkSnapping();
			
			//change the position of the corresponding shadow markers
			if (this.shadowPrev) {
				this.shadowPrev.setPosition(this.polygon.getShadowPosition(this, this.shadowPrev.prev));
			}
			if (this.shadowNext) {
				this.shadowNext.setPosition(this.polygon.getShadowPosition(this, this.shadowNext.next));
			}

			return this;
		},
		/**
		 * Finish the marker's move (hard snap it and all the markers it is snapped to suitable targets).
		 * 
		 * @param {boolean} propagate
		 * @returns {Marker}
		 */
		finishMove: function(propagate){
			propagate = propagate === undefined ? true : propagate;
			
			// prepare all the snapped markers as well
			if (propagate) {
				for (var i in this.snappedTo) {
					this.snappedTo[i].finishMove(false);
				}
			}
			this.checkSnapping(true);
			
			return this;
		},
		/**
		 * Snap to potential snap target(s) if appropriate.
		 * 
		 * @param {boolean} [hard=false] Hard snap.
		 * @returns {roke.polygons.Marker}
		 */
		checkSnapping: function(hard) {
			var position = this.getPosition();

			for (var i in this.snapTargets) {
				var target = this.snapTargets[i];

				//skip if it is already snapped to this target
				if (this.snappedTo.indexOf(target) !== -1 || !target) {
					continue;
				}

				//light snap to the target if the distance is smaller than the snap distance
				if (Utils.getDistance(position, target.getPosition()) < this.map.getRealDistance(this.snapDistance)) {
					this.snapTo(target, hard);
				}
			}

			return this;
		},
		/**
		 * Snap to the target.
		 * 
		 * @param {roke.polygons.Marker} target
		 * @param {Boolean} [hard=true] If set to true, a hard snap will be created (can be undone only by deleting one of the points).
		 * @returns {roke.polygons.Marker}
		 */
		snapTo: function(target, hard) {
			this.polygon.setPoint(this.index, target.getPosition());

			if (hard) {
				// bind the two markers
				if (this.snappedTo.indexOf(target) === -1) {
					this.snappedTo.push(target);
				}
				if (target.snappedTo.indexOf(this) === -1) {
					target.snappedTo.push(this);
				}

				// update snapping targets
				//this.updateSnapTargets();
				//target.updateSnapTargets();
			}

			return this;
		},
		/**
		 * Get potential snap targets.
		 * 
		 * @returns {roke.polygons.Marker}
		 */
		updateSnapTargets: function() {
			// get all the markers of the other polygons
			this.snapTargets = [];

			// skip this marker's polygon and all the polygons to whose markers this one is already snapped
			var skipPolygons = [this.polygon];
			for (var i in this.snappedTo) {
				skipPolygons.push(this.snappedTo[i].polygon);
			}

			var polygons = this.map.getPolygons();
			for (var i in polygons) {
				var polygon = polygons[i];

				// skip given polygons
				if (skipPolygons.indexOf(polygon) !== -1) {
					continue;
				}

				// add the targets
				for (var j in polygon.markers) {
					this.snapTargets.push(polygon.markers[j]);
				}
			}

			return this;
		},
		/**
		 * Unsnap this marker from the target.
		 * 
		 * @param {roke.polygons.Marker} marker
		 * @param {Boolean} propagate
		 * @returns {roke.polygons.Marker}
		 */
		unsnap: function(target, propagate) {
			propagate = propagate === undefined ? true : propagate;
			
			this.snappedTo.splice(this.snappedTo.indexOf(target), 1);
			this.updateSnapTargets();
			
			if(propagate){
				target.unsnap(this, false);
			}

			return this;
		},
		/**
		 * Unsnap from all the targets.
		 * 
		 * @returns {roke.polygons.Marker}
		 */
		unsnapAll: function() {
			//unsnap from all
			while (this.snappedTo.length > 0) {
				this.unsnap(this.snappedTo[0]);
			}
			return this;
		},
		/**
		 * Remove this marker (and the corresponding point!).
		 * 
		 * @returns {roke.polygons.Marker}
		 */
		remove: function() {
			if (!this.shadow) {
				this.polygon.removePoint(this.index);
			}
			this.setMap(null);

			return this;
		},
		/**
		 * Is this a shadow marker?
		 * 
		 * @returns {Boolean}
		 */
		isShadow: function() {
			return this.shadow === true;
		},
		/**
		 * Set marker's index (corresponds to the point).
		 * 
		 * @param {number} index
		 * @returns {Marker}
		 */
		setIndex: function(index) {
			this.index = parseInt(index);
			return this;
		}
	});

	Marker.defaults = {
		draggable: true,
		//distance (at map's base zoom) at which the marker should start snapping to others
		//0.012 seems to be working rather nicely for base zoom 10
		snapDistance: 0.012
	};

	roke.polygons.Marker = Marker;
})();


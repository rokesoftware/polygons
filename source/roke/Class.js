/**
 * @preserve
 * 
 * Class - JavaScript implementation of the classical inheritance
 * Version: 0.1.0
 * Requires jQuery v2.0 or later
 *
 * License: https://github.com/rokesoftware/polygons/blob/master/License
 *
 * Copyright 2014 Roke Software - info@roke.cz
 */

/**
 * A basic implementation of the classical inheritance.
 * 
 * 
 * Key concepts
 * ==================================================
 * 
 * Normalized class is an object that was created by extending some other
 * normalized class (typically by calling NormalizedClass.extend({...});
 * 
 * Class is therefore a common ancestor of all normalized classes.
 * 
 * Any class can be converted into a normalized class by calling
 * Class.extend(classConstructor).
 * 
 * The construction function called on creation is called init.
 * 
 * A parent's overriden method can be called via this._super(fn, args).
 * 
 * 
 * Usage
 * ==================================================
 * 
 * var Person = Class.extend({
 *   init: function(name){
 *     this.name = name;
 *   },
 *   speak: function(){
 *     return "Hi, my name is " + this.name + ".";
 *   }
 * });
 * 
 * var Musician = Person.extend({
 *   init: function(name, instrument){
 *     this._super('init', [name]);
 *     this.instrument = instrument;
 *   },
 *   play: function(){
 *     return "I play the " + this.instrument + "!";
 *   }
 * });
 * 
 * var john = new Musician('John', 'guitar');
 * 
 * // Hi, my name is John.
 * console.log(john.speak());
 * 
 * // I play the guitar!
 * console.log(john.play());
 * 
 * //true
 * console.log(john instanceof Musician);
 * 
 * //true
 * console.log(john instanceof Person);
 * 
 * //true
 * console.log(john instanceof Class);
 */

(function() {
	var initializing = false;
	this.Class = function() {
	};

	/**
	 * Extend class.
	 * 
	 * @param {Object|Function} extension Prototype of the new class or a non-normalized function.
	 * @returns {Class} New class prototype.
	 */
	Class.extend = function(extension) {
		
		//prototype of a new class
		if (typeof extension === 'object') {
			initializing = true;
			var prototype = new this();
			initializing = false;
			for (var name in extension) {
				prototype[name] = extension[name];
			}
			Class.prototype = prototype;
		}
		
		//class to be normalized
		else if (typeof extension === 'function') {
			Class.prototype = extension.prototype;
			Class.prototype.init = function() {
				extension.apply(this, arguments);
			};
		}

		//constructor
		function Class() {
			if (!initializing && this.init) {
				this.init.apply(this, arguments);
			}
		}

		//change constructor to what we expect it to be
		Class.prototype.constructor = Class;
		//make the class extendable
		Class.extend = this.extend;
		//allow calling parent's methods by calling this._super(fn, args) 
		var _super = this.prototype;
		Class.prototype._super = function(fn, args) {
			return _super[fn].apply(this, args);
		};

		return Class;
	};
})();
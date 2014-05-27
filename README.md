# Polygons


An extension of Google Maps API allowing users to create and manage polygons.
It offers easily editable shapes, point snapping and more.

## Why an extension?

Google Maps API is a great tool but we found that it does not
provide us with what we need even when combined with the Drawing Tools.
Two main features we needed were:					

1. a fictional point in the middle of every edge in order for the shapes to be easily editable</li>
2. the possibility to snap points to the vertices of other polygons</li>

When you combine
[Drawing Tools](https://developers.google.com/maps/documentation/javascript/examples/drawing-tools) with
[User-editable Shapes](https://developers.google.com/maps/documentation/javascript/examples/user-editable-shapes)
the first feature is covered. It turns out though that because (almost) all events are ignored
when a point of an editable shape is dragged, point snapping cannot be achieved using the standard
Google tools.
				
## Usage

The extension is written using classical inheritance ([Class.js](https://github.com/rokesoftware/polygons/blob/master/source/roke/Class.js)
and dive in the source from there)
and can therefore be used in the same way as the Google Maps API. For the extra bits it offers,
see the demos, please. [This one](http://tadeaspetak.net/roke/polygons/demo/simple.html) is real simple while
[this one](http://tadeaspetak.net/roke/polygons/demo/details.html) is a bit more advanced.
				
## Dependencies
[Google Maps API](https://developers.google.com/maps/documentation/javascript/tutorial) obviously... and that's it!
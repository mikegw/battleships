//Note: This is overkill, but a useful proof of concept.

var eventBus = Battleships.eventBus = {};

// Use .extend from underscore.js to mix in all the properties
// of Backbone.Events

for (prop in Backbone.Events) {
  if (hasOwnProperty.call(Backbone.Events, prop)) {
    eventBus[prop] = Backbone.Events[prop];
  }
}

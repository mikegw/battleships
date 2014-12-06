window.Battleships = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function() {

    this.router = new Battleships.Routers.router(); 
    // this.startPusher();
    Backbone.history.start();
    Backbone.history.navigate("", {trigger: true});
  }

};

window.Battleships = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function() {

    this.startPusher();

    this.router = new Battleships.Routers.router();
    console.log("here");

    Backbone.history.start();
    Backbone.history.navigate("", {trigger: true});
  },

  startPusher: function () {
    this.pusher = new Pusher('eb3129be285c0b81c09f');

    var that = this;
    this.pusher.connection.bind('connected', function() {
      that.socketId = that.pusher.connection.socket_id;
    });
  }

};

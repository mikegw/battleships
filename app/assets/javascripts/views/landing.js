Battleships.Views.Landing = Backbone.View.extend({

  template: JST["landing"],

  events: {
    "click #start": "createGame"
  },

  render: function () {
    content = this.template();
    this.$el.html(content);
    return this;
  },

  createGame: function() {
    Backbone.history.navigate("play", {trigger: true});
    Battleships.eventBus.trigger("create");
  }

});

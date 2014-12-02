Battleships.Views.GameShow = Backbone.View.extend({

  initialize: function () {

  },

  template: JST["game/show"],

  render: function () {
    content = this.template({
      game: this.model
    });
    this.$el.html(content);
    return this;
  }

});

Battleships.Views.GameIndex = Backbone.View.extend({

  initialize: function () {

  },

  template: JST["game/index"],

  render: function () {
    content = this.template({
      user: this.model
    });
    this.$el.html(content);
    return this;
  }

});

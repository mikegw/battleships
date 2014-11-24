Battleships.Views.Landing = Backbone.View.extend({

  template: JST["landing"],

  render: function () {
    content = this.template();
    this.$el.html(content);
    return this;
  },

});

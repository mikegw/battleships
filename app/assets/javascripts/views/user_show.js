Battleships.Views.UserRegistration = Backbone.View.extend({

  initialize: function () {

  },

  template: JST["user/show"],

  render: function () {
    content = this.template({
      user: this.model
    });
    this.$el.html(content);
    return this;
  }

});

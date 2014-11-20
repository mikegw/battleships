Battleships.Views.UserRegistration = Backbone.View.extend({

  initialize: function () {

  },

  template: JST["user_registration/new"],

  render: function () {
    content = this.template({
      user = new Battleships.Models.UserRegistration();
    });
    this.$el.html(content);
    return this;
  }

})

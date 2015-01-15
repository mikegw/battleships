Battleships.Views.UserShow = Backbone.View.extend({

  initialize: function () {

  },

  template: JST["user/show"],

  events: {
    "click #sign-out-button": "signOut"
  },

  render: function () {
    content = this.template({
      user: this.model
    });
    this.$el.html(content);
    return this;
  },

  signOut: function (event) {
    console.log("signing out");
    event.preventDefault();

    $.ajax({
      url: "/api/session",
      type: "Delete",
      success: function (response) {
        console.log("signed out");
        Battleships.currentUser = null;
        Backbone.history.navigate("", {trigger: true});
      }
    });
  }

});

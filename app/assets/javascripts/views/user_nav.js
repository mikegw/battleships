Battleships.Views.UserNav = Backbone.View.extend({

  initialize: function () {

  },

  events: {
    "submit #sign-in-form": "signIn",
    "submit #sign-up-form": "signUp"
  },

  template: JST["user/new_session"],

  render: function () {
    content = this.template({
      user: new Battleships.Models.User()
    });
    this.$el.html(content);
    return this;
  },

  signIn: function (event) {
    console.log("signing in");
    event.preventDefault();
    var params = $(event.currentTarget).serializeJSON();

    $.ajax({
      url: "/session.json",
      type: "POST",
      data: params,
      success: function (response) {
        console.log("Signed in", response);
        Backbone.history.navigate("play", {trigger: true});
      },
      error: function () {
        console.log("Failed to sign in!");
        $("#user-password").val("");
      }
    });
  },

  signUp: function (event) {
    console.log("signing up");
    event.preventDefault();
    debugger
    var params = $(event.currentTarget).serializeJSON();

    $.ajax({
      url: "/users.json",
      type: "POST",
      data: params,
      success: function (response) {
        console.log("Signed Up", response);
        Backbone.history.navigate("play", {trigger: true});
      },
      error: function () {
        console.log("Failed to create!");
        $(event.currentTarget).$("#user-password").val("");
      }
    });
  }

});

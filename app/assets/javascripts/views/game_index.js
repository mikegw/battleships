Battleships.Views.GameIndex = Backbone.View.extend({

  initialize: function () {

  },

  events: {
    "click .tab": "switchTab"
  },

  template: JST["game/index"],

  render: function () {
    content = this.template({
      user: this.model
    });
    this.$el.html(content);
    return this;
  },

  switchTab: function (event) {
    tabClicked = $(event.currentTarget);
    $(".active").removeClass("active");
    if (tabClicked.attr("id") == "open-tab") {
      $(".open").addClass("active");
    } else {
      $(".full").addClass("active");
    }

  }

});

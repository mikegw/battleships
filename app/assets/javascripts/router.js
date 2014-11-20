Battleships.Routers.router = Backbone.Router.extend({

  routes: {
    '', ""
  },

  initialize: function () {
    this.$el = $("body");
    this.$mainEl = $("<main>");
    this.$navEl = $("<nav>");
    this.$el.html(this.$navEl);
    this.$el.append(this.$mainEl);
  },

  _swapNavView: function(newView) {
    this.navView && this.navView.remove();
    this.navView = newView;

    this.$navEl.html(newView.render().$el);
  }

  _swapMainView: function(newView) {
    this.mainView && this.mainView.remove();
    this.mainView = newView;

    this.$mainEl.html(newView.render().$el);
  }

});

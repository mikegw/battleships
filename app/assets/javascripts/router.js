Battleships.Routers.router = Backbone.Router.extend({

  routes: {
    '': 'landing',
    'play': 'gameIndex',
    'new_session': 'newSession',
    'signup': 'registerUser'

  },

  initialize: function () {
    this.$el = $("body");

    this.$mainEl = $("<main>");
    this.$navEl = $("<nav>");

    this.$el.html(this.$navEl);
    this.$el.append(this.$mainEl);
  },

  landing: function () {
    this.newSession();

    var landingView = new Battleships.Views.Landing();
    this._swapMainView(landingView);
  },


  newSession: function () {
    var newSessionView = new Battleships.Views.UserNav();
    this._swapNavView(newSessionView);
  },

  userShow: function () {
    var showUserView = new Battleships.Views.UserShow({
      model: Battleships.currentUser
    });
    this._swapNavView(showUserView);
  },


  gameIndex: function () {
    if (Battleships.currentUser) {
      this.userShow();
    }
    var gameIndexView = new Battleships.Views.GameIndex({

    });
    this._swapMainView(gameIndexView);
  },

  gameShow: function () {
    if (Battleships.currentUser) {
      var gameShowView = new Battleships.Views.GameShow();
      this._swapMainView(gameShowView);
    } else {
      Backbone.history.navigate("gameIndex", {trigger: true});
    }
  },


  _swapNavView: function (newView) {
    this.navView && this.navView.remove();
    this.navView = newView;

    this.$navEl.html(newView.render().$el);
  },

  _swapMainView: function (newView) {
    this.mainView && this.mainView.remove();
    this.mainView = newView;

    this.$mainEl.html(newView.render().$el);
  }

});

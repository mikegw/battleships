Battleships.Routers.router = Backbone.Router.extend({

  routes: {
    '': 'landing',
    'play': 'gameIndex',
    'new_session': 'newSession',
    'signup': 'registerUser'

  },

  initialize: function () {
    this.$el = $("body");
    this.$el.addClass("group")

    this.$navEl = $("<nav class=\"navbar\">");
    this.$mainEl = $("<main class=\"main-panel\">");
    this.$sideEl = $("<section class=\"side-panel\">");

    this.$el.html(this.$navEl);
    this.$el.append(this.$mainEl);
    this.$el.append(this.$sideEl);

    this._fetchCurrentUser();
  },

  landing: function () {
    this.newSession();
    this.gameIndex();

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
    //console.log("currentUser", Battleships.currentUser)
    if (Battleships.currentUser) {
      console.log("Huzzah!")
      this.userShow();
    }
    var gameIndexView = new Battleships.Views.GameIndex({

    });
    this._swapSideView(gameIndexView);

    this.gameShow();

  },

  gameShow: function () {
    if (Battleships.currentUser) {
      var gameShowView = new Battleships.Views.GameShow();
      this._swapMainView(gameShowView);
    } else {
      Backbone.history.navigate("", {trigger: true});
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
  },

  _swapSideView: function (newView) {
    this.sideView && this.sideView.remove();
    this.sideView = newView;

    this.$sideEl.html(newView.render().$el);
  },

  _fetchCurrentUser: function () {
    var that = this;
    $.ajax({
      url: "/api/users/current",
      success: function (response) {
        if (response) {
          Battleships.currentUser = new Battleships.Models.User(response)
          that.userShow();
        }
      }

    });
  }

});

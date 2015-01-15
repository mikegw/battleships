Battleships.Routers.router = Backbone.Router.extend({

  routes: {
    '': 'landing',
    'signIn': 'userShow',
    'play': 'gameShow',
    'newSession': 'newSession'
  },

  initialize: function () {
    this.$el = $("body");

    this.$navEl = $("<nav class=\"navbar\">");
    this.$mainEl = $("<main class=\"group\">");
    this.$leftEl = $("<section class=\"left-panel\">")
    this.$rightEl = $("<section class=\"right-panel\">");

    this.$el.html(this.$navEl);
    this.$el.append(this.$mainEl);
    this.$mainEl.append(this.$leftEl);
    this.$mainEl.append(this.$rightEl);
    console.log(1);
    this._fetchCurrentUser();
    console.log(2);
    this.gameIndex();
    console.log(3);
  },

  landing: function () {
    if(!Battleships.currentUser) {
      this.newSession();
    }
    this.gameIndex();

    var landingView = new Battleships.Views.Landing();
    this._swapLeftView(landingView);
  },


  newSession: function () {
    var newSessionView = new Battleships.Views.UserNav();
    this._swapNavView(newSessionView);
  },

  userShow: function () {
    console.log("Current User:", Battleships.currentUser.get("username"));

    $(".landing").toggleClass("active");

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
    var gameIndexView = new Battleships.Views.GameIndex();
    this._swapRightView(gameIndexView);
  },

  gameShow: function () {
    console.log("Showing game");
    if (Battleships.currentUser) {
      var gameShowView = new Battleships.Views.GameShow();
      this._swapLeftView(gameShowView);
    } else {
      Backbone.history.navigate("", {trigger: true});
    }
  },


  _swapNavView: function (newView) {
    this.navView && this.navView.remove();
    this.navView = newView;

    this.$navEl.html(newView.render().$el);
  },

  _swapLeftView: function (newView) {
    this.leftView && this.leftView.remove();
    this.leftView = newView;

    this.$leftEl.html(newView.render().$el);
  },

  _swapRightView: function (newView) {
    this.rightView && this.rightView.remove();
    this.rightView = newView;

    this.$rightEl.html(newView.render().$el);
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

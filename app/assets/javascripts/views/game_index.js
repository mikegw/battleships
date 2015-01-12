Battleships.Views.GameIndex = Backbone.View.extend({
  //TODO
//http://api.rubyonrails.org/classes/ActiveRecord/Locking/Optimistic.html

  initialize: function () {
    this.channel = Battleships.pusher.subscribe("battleships");
    this.openGames = [];
    this.fullGames = [];
    this.fetchGames();
  },

  events: {
    "click .tab": "switchTab",
    "click .open li": "join"
  },

  template: JST["game/index"],

  render: function () {
    content = this.template({
      openGames: this.openGames,
      fullGames: this.fullGames
    });
    this.$el.html(content);
    return this;
  },

  fetchGames: function () {
    $.ajax({
      url: "/api/games",
      type: "get",
      success: function(response) {
        console.log("fetched games:", response);
        this.openGames = response.openGames;
        this.fullGames = response.fullGames;
        this.channel.bind("open", this.openGame.bind(this));
        this.channel.bind("full", this.fullGame.bind(this));
        this.render();
      }.bind(this),
      error: console.log
    })
  },

  //TODO (Optional) Refactor to deal with large numbers of games

  openGame: function (game) {
    this.openGames.push(game);
    this.render();
  },

  fullGame: function (game) {
    this.fullGames.push(game);

    for(openGameIdx in this.openGames){
      if (this.openGames[openGameIdx].id == game.id) {
        this.openGames.splice(openGameIdx, 1);
        break;
      }
    }

    this.render();
  },

  switchTab: function (event) {
    tabClicked = $(event.currentTarget);
    $(".active").removeClass("active");
    if (tabClicked.attr("id") == "open-tab") {
      $(".open").addClass("active");
    } else {
      $(".full").addClass("active");
    }

  },

  join: function (event) {
    gameId = $(event.currentTarget).data("id");
    Backbone.history.navigate("play", {trigger: true});
    Battleships.eventBus.trigger("join", gameId);
  }

});

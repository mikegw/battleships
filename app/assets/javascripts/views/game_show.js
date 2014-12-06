Battleships.Views.GameShow = Backbone.View.extend({

  initialize: function () {
    this.render();
  },

  events: {
    "click #start": "startGame",
    "mousedown #main-canvas": "startShip",
    "mouseup #main-canvas": "endShip",
  },

  template: JST["game/show"],

  render: function () {
    var content = this.template();
    this.$el.html(content);
    return this;
  },

  startGame: function () {
    this.mainCanvas = document.getElementById("main-canvas");
    this.sideCanvas = document.getElementById("side-canvas");
    Battleships.game = new Battleships.Game(this.mainCanvas, this.sideCanvas);
  },

  processClick: function (click) {
    var offset = $(this.mainCanvas).offset();
    var pos = {
      x: click.pageX - offset.left,
      y: click.pageY - offset.top
    }
    // Battleships.game.selectSq(pos);
    return pos;
  },

  startShip: function (event) {
    Battleships.game.selectSq(this.processClick(event));
    if (Battleships.game.gameState == "add ships") {
      this.bow = this.processClick(event);
    }
  },

  endShip: function (event) {
    if (this.bow) {
      var stern = this.processClick(event);
      Battleships.game.addShip(this.bow, stern);
      this.bow = null;
    }
  }

});

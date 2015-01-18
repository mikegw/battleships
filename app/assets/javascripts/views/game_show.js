Battleships.Views.GameShow = Backbone.View.extend({

  initialize: function () {
    this.render();

    Battleships.eventBus.bind("create", this.createGame.bind(this));
    Battleships.eventBus.bind("join", this.joinGame.bind(this));
  },

  events: {
    "mousedown #main-canvas": "handleMouseDown",
    "mouseup #main-canvas": "handleMouseUp",
  },

  template: JST["game/show"],

  render: function () {
    var content = this.template();
    this.$el.html(content);
    return this;
  },

  startPusher: function () {
    this.channel = Battleships.pusher.subscribe("battleships" + this.gameId);
    this.bindPusherEvents();
  },

  bindPusherEvents: function () {
    console.log("binding pusher to channel", this.channel)
    this.channel.bind("opponent join", function (opponent) {
      console.log("opponent joined");
      this.changeHeader("You are playing against " + opponent);
      this.startGame();
    }.bind(this));

    this.channel.bind("move",(function (move) {
      var moveResult = Battleships.game.receiveMove(move);
      this.sendMoveResult(moveResult);
      this.notify(Battleships.Game.MESSAGES["myMove"]);
    }).bind(this));

    this.channel.bind("moveResult", function (moveResult) {
      this.notify(Battleships.game.receiveMoveResult(moveResult).message);
      if (moveResult == "gameover") {
        this.gameOver();
      }
    }.bind(this));

    this.channel.bind("ready", function () {
      console.log("Opponent ready")
      this.notify(Battleships.game.receiveReady().message);
    }.bind(this));

    this.channel.bind("to move", function (username) {
      //TODO COULD CAUSE PROBLEMS!!
      console.log("I am", Battleships.currentUser.get("username"))
      console.log("to move:", username)

      if (Battleships.currentUser.get("username") === username) {
        Battleships.game.myMove();
      } else {
        Battleships.game.opponentsMove();
      }
    }.bind(this));

  },

  createGame: function () {
    console.log("creating");
    var that = this;
    $.ajax({
      url: "/api/games",
      type: "post",
      //TODO do I need data?
      success: function (response) {
        console.log("successful", response);
        that.notify("Waiting for Opponent...");
        that.gameId = response;
        that.startPusher();
      },
      error: function (response) {
        console.log("failed!", response);
      }
    });
  },

  joinGame: function (joinData) {
    console.log("joining");
    var that = this;
    $.ajax({
      url: "/api/games/" + joinData.gameId + "/join",
      type: "get",
      //TODO do I need data?
      success: function (response) {
        console.log("joined:", response);
        that.notify("Joined " + joinData.opponent + "'s game");
        that.notify(Battleships.Game.MESSAGES["start"]);
        that.changeHeader("You are playing against " + joinData.opponent);
        that.gameId = response.id;
        console.log("Game Id:", that.gameId)
        that.startPusher();
      },
      error: function (response) {
        console.log(response);
      }
    });
    this.startGame();
  },

  startGame: function () {
    console.log("starting");
    this.notify("Starting Game...")
    this.mainCanvas = function () {
      return document.getElementById("main-canvas");
    };
    this.sideCanvas = function () {
      return document.getElementById("side-canvas");
    };
    Battleships.game = new Battleships.Game(this.mainCanvas, this.sideCanvas);
    this.notify(Battleships.Game.MESSAGES["start"]);
  },

  processMouseEvent: function (mouseEvent) {
    var offset = $(this.mainCanvas()).offset();
    var pos = {
      x: mouseEvent.pageX - offset.left,
      y: mouseEvent.pageY - offset.top
    }
    // Battleships.game.selectSq(pos);
    return pos;
  },

  startShip: function (event) {
    Battleships.game.selectSq(this.processMouseEvent(event));
    this.bow = this.processMouseEvent(event);
  },

  endShip: function (event) {
    var that = this;
    if (this.bow) {
      var stern = this.processMouseEvent(event);
      var addShipStatus = Battleships.game.addShip(this.bow, stern);
      console.log(addShipStatus);
      if (addShipStatus.error) {
        console.log(addShipStatus.error);
      } else if (Battleships.game.gameState === "ready"
          || Battleships.game.gameState === "in play") {
        //TODO COULD CAUSE PROBLEMS
        $.ajax({
          url: "/api/games/" + String(this.gameId),
          type: "PATCH",
          data: {
            event: "ready",
            event_data: {},
            //TODO YUCK - fix this!
            socket_id: Battleships.pusher.connection.socket_id
          },
          success: function(response){
            console.log(response);
          },
          error: function(response) {
            console.log(response);
          }
        })
      }
      console.log(addShipStatus)
      this.notify(addShipStatus.message);
      if (Battleships.game.gameState === "in play") {
        this.notify(Battleships.game.toMove().message);
      }
      this.bow = null;
    }
  },

  makeMove: function (rawPos) {
    var pos = this.processMouseEvent(event);
    var move = Battleships.game.makeMove(pos);
    if (move.error) {
      console.log(move.error);
    } else {
      $.ajax({
        url: "/api/games/" + String(this.gameId),
        type: "PATCH",
        data: {
          event: "move",
          event_data: move,
          socket_id: Battleships.pusher.connection.socket_id
        },
        success: function(response){
          console.log(response);
        },
        error: function(response) {
          console.log(response);
        }
      })
    }
  },

  sendMoveResult: function (moveResult) {
    console.log("Sending Move Result:", moveResult)
    $.ajax({
      url: "/api/games/" + String(this.gameId),
      type: "PATCH",
      data: {
        event: "moveResult",
        event_data: moveResult,
        socket_id: Battleships.pusher.connection.socket_id
      },
      success: function(response){
        console.log("Sent move Result", response);
      },
      error: function(responsetextStatus, textStatus, errorThrown) {
        console.log("Move Result Failed!");
        console.log("Status: " + textStatus);
        console.log("Error: " + errorThrown);
      }
    });
    if (moveResult == "gameover") {
      this.gameOver();
    }
  },

  handleMouseDown: function (event) {
    console.log("mouse DOWN")
    if (Battleships.game.gameState === "in play") {
      console.log("making move")
      this.makeMove(event);
    } else if (Battleships.game.gameState === "add ships") {
      console.log("adding Ships")
      this.startShip(event);
    } else {
      console.log("Opponent not ready!")
    }
  },

  handleMouseUp: function (event) {
    console.log("mouse UP")
    if (Battleships.game.gameState === "add ships") {
      this.endShip(event);
    }
  },

  gameOver: function (event) {
    this.notify(Battleships.game.gameOver().message);
    setTimeout(function () {
      Backbone.history.navigate("", {trigger: true});
    }, 1000);
  },

  notify: function (message) {
    $(".game-footer").text(message);
  },

  changeHeader: function (message) {
    $(".game-header").text(message);
  }

});

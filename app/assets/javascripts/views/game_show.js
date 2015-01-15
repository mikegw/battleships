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
    this.channel.bind("opponent join", function () {
      console.log("opponent joined");
      this.startGame();
    }.bind(this));

    this.channel.bind("move",(function (move) {
      var moveResult = Battleships.game.receiveMove(move);
      this.sendMoveResult(moveResult);
    }).bind(this));

    this.channel.bind("moveResult", function (moveResult) {
      Battleships.game.receiveMoveResult(moveResult);
      this.notify(moveResult);
      if (moveResult == "gameover") {
        this.gameOver();
      }
    }.bind(this));
    this.channel.bind("ready", function () {
      Battleships.game.receiveReady();
    }.bind(this));
    this.channel.bind("to move", function (username) {
      console.log("I am", Battleships.currentUser.get("username"))
      console.log("to move:", username)

      if (Battleships.currentUser.get("username") === username) {
        Battleships.game.myMove();
        this.notify("Your move");
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

  joinGame: function (gameId) {
    console.log("joining");
    var that = this;
    $.ajax({
      url: "/api/games/" + gameId + "/join",
      type: "get",
      //TODO do I need data?
      success: function (response) {
        console.log("joined:", response);
        that.notify("Joined game");
        that.gameId = response.id;
        if (Battleships.currentUser.get("username") === response.toMove) {
          Battleships.game.myMove();
        }
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
    this.notify("Please add your ships!");
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
      } else if (addShipStatus === "ready") {
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
            that.notify("Ship added");
            if (Battleships.game.gameState === "add ships") {
              that.notify("Please add another ship")
            }
            console.log(response);
          },
          error: function(response) {
            console.log(response);
          }
        })
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
    console.log("Game Over");
    setTimeout(function () {
      Backbone.history.navigate("", {trigger: true});
    }, 1000);
  },

  notify: function (message) {
    $(".notification").text(message);
  }

});

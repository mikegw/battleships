// Could create a game model but prefer to treat game as a plugin
// and send ajax requests to trigger updates. Since each
// player only has partial information, all that a game model would
// store is the game's id, in which case creating a model seems
// like overkill.

var Game = Battleships.Game = function (mainCanvas, sideCanvas) {
  this.mainCtx = function () {
    return mainCanvas().getContext("2d");
  };
  this.sideCtx = function () {
    return sideCanvas().getContext("2d");
  };
  this.ships = [];
  this.shipTypes = Game.SHIP_TYPES;
  this.myBoard = [];
  this.myMoves = [];
  this.enemyBoard = [];
  this.gameState = "add ships";
  this.isMyMove = false;
  this.hitCount = 0;

  this.setupEmptyBoard(this.myBoard);
  this.setupEmptyBoard(this.enemyBoard);
  this.draw();
};

Game.SHIP_TYPES = [5,3,1];
Game.SHIP_SQUARES_COUNT = Game.SHIP_TYPES.reduce(function(a, b) {
  return a + b;
});
Game.BOARD_SIZE = 10;
Game.MESSAGES = {
  "miss": "Missed!",
  "hit": "You HIT an enemy ship!",
  "sink": "Good shot! You SUNK an enemy ship!",
  "invalidship": "You cannot place a ship there!"
};
// Game.SHIPS_IMG = new Image();
// Game.SHIPS_IMG.src = "ships.png"
// Game.BKGD_IMG = new Image();
// Game.BKGD_IMG.src = "Sea_Texture_2_by_goldberry2000.jpg"

Game.prototype.setupEmptyBoard = function (board) {

  for (var r = 0; r < Game.BOARD_SIZE; r++) {
    var row = [];
    for (var c = 0; c < Game.BOARD_SIZE; c++) {
      row.push(new Square({row: r, col: c}));
    }
    board.push(row);
  }
}

Game.prototype.draw = function () {
  if (this.gameState == "in play") {
    console.log("drawing in play");

    for (var row in this.myBoard) {
      for (var sq in this.myBoard[row]) {
        this.myBoard[row][sq].draw(this.sideCtx, 30);
      }
    }

    for (var row in this.enemyBoard) {
      for (var sq in this.enemyBoard[row]) {
        this.enemyBoard[row][sq].draw(this.mainCtx, 60);
      }
    }
  } else {
    console.log("drawing");
    for (var row in this.myBoard) {
      for (var sq in this.myBoard[row]) {
        this.myBoard[row][sq].draw(this.mainCtx, 60);
      }
    }
  }
};

Game.prototype.posToCoords = function(pos) {
  var row = Math.floor(pos.y / 60);
  var col =  Math.floor(pos.x / 60);
  return {row: row, col: col};
}

Game.prototype.selectSq = function (pos) {
  var coords = this.posToCoords(pos);
  if (this.selected) {
    this.selected.isSelected = false;
    this.selected.draw(this.mainCtx, 60);
  }
  this.selected = this.myBoard[coords.row][coords.col]
  this.selected.isSelected = true;
  this.selected.draw(this.mainCtx, 60);
}

Game.prototype.addShip = function (bowPos, sternPos) {
  var bowCoords = this.posToCoords(bowPos);
  var sternCoords = this.posToCoords(sternPos);

  this.selected.isSelected = false;
  this.selected.draw(this.mainCtx, 60)
  this.selected = null;

  if(this.checkShipIsValid(bowCoords, sternCoords)){
    var rowDif = sternCoords.row - bowCoords.row;
    var colDif = sternCoords.col - bowCoords.col;
    var game = this;
    var shipLength;

    if (rowDif) {
      shipLength = rowDif + 1;
    } else {
      shipLength = colDif + 1;
    }

    var ship = {
      bow: bowCoords,
      stern: sternCoords,
      health: Math.abs(shipLength)
    }

    var validLength = false;

    for (var i = 0; i < this.shipTypes.length; i++) {
      if(this.shipTypes[i] === ship.health) {
        this.ships.push(ship);
        this.shipTypes.splice(i,1);
        validLength = true;
        if(this.shipTypes.length === 0) {
          if(this.opponentReady) {
            this.gameState = "in play";
          } else {
            this.gameState = "ready";
          }
        }
        break;
      }
    }

    if (validLength) {

      var direction = (shipLength == Math.abs(shipLength)) ? 1 : -1;
      var i = 0;

      var loop = function () {
        if (rowDif) {
          game.myBoard[bowCoords.row + i][bowCoords.col].state = "ship";
          game.myBoard[bowCoords.row + i][bowCoords.col].draw(game.mainCtx, 60);
        } else {
          game.myBoard[bowCoords.row][bowCoords.col + i].state = "ship";
          game.myBoard[bowCoords.row][bowCoords.col + i].draw(game.mainCtx, 60);
        }

        i += direction;
        if (Math.abs(i) < Math.abs(shipLength)) {
          setTimeout(loop, 50);
        } else {
          game.draw();
        }
      }
      loop();
      if (game.gameState === "ready" || game.gameState === "in play") {
        return "ready";
      } else {
        return "ok"; // TODO better name for this
      }
    } else {
      return {error: Game.MESSAGES["invalidship"]};
    }

  } else {
    return {error: Game.MESSAGES["invalidship"]};
  }
};

Game.prototype.checkShipIsValid = function (bowCoords, sternCoords) {
  for (var i in this.ships) {
    var ship = this.ships[i];
    if(
      !(
        Math.max(bowCoords.row,sternCoords.row) < Math.min(ship.bow.row, ship.stern.row) ||
        Math.min(bowCoords.row,sternCoords.row) > Math.max(ship.bow.row, ship.stern.row) ||
        Math.max(bowCoords.col,sternCoords.col) < Math.min(ship.bow.col, ship.stern.col) ||
        Math.min(bowCoords.col,sternCoords.col) > Math.max(ship.bow.col, ship.stern.col)
      )
    ) {
      return false;
    }
  }
  return true;
};

Game.prototype.myMove = function () {
  console.log("my Move");
  this.isMyMove = true;
};

Game.prototype.receiveReady = function () {
  console.log("ready received");
  this.opponentReady = true;
  if (this.gameState === "ready") {
    console.log("Game in play");
    this.gameState = "in play";
    this.draw();
  }
};

// A move is made as follows:
// 1)  Player 1 clicks on a position "pos"
//
// 2)  The ui hears the click event and passes pos to the game
//     by calling makeMove(pos)
//
// 3)  The game returns either an error or the pos to the ui
//
// 4)  If the game returns an error, the ui displays it to the
//     screen
//
// 5)  If the game returns the pos, this is sent to Player 2
//
// 6)  Player 2 receives pos and passes it to Player 2's game
//     by calling receiveMove(pos)
//
// 7)  Player 2's game works out the result of the move
//
// 8)  Player 2's game displays the move and returns the result
//
// 9)  Player 2's ui sends a moveResult to Player 1
//
// 10) Player 1's ui calls receiveMoveResult(moveResult) which
//     displays the result of the move to Player 1

Game.prototype.makeMove = function (pos) {
  // The player has clicked on a position pos
  if (!this.isMyMove){

    return {
      error: "It isn't your move!"
    };

  } else {

    var coords = this.posToCoords(pos);

    for (var i = 0; i < this.myMoves.length; i++) {
      if (this.myMoves[i].row == coords.row && this.myMoves[i].col == coords.col) {
        return {
          error: "You have already fired at this location!"
        };
      }
    }

    //TODO Display move
    this.myMoves.push(coords);
    return coords;

  }

};

Game.prototype.receiveMove = function (coords) {
  console.log("Move received:", coords)
  // The opponent has clicked on coordsition coords
  this.myMove();

  for (shipIdx in this.ships) {
    console.log(this.ships, shipIdx, this.ships[shipIdx]);
    var ship = this.ships[shipIdx];

    var minRow = Math.min(ship.bow.row, ship.stern.row);
    var maxRow = Math.max(ship.bow.row, ship.stern.row);

    var minCol = Math.min(ship.bow.col, ship.stern.col);
    var maxCol = Math.max(ship.bow.col, ship.stern.col);

    var shipHit = (
      coords.row >= minRow && coords.row <= maxRow &&
      coords.col >= minCol && coords.col <= maxCol
    );

    console.log(shipHit);

    if (shipHit) {

      this.myBoard[coords.row][coords.col].state = "hit";
      this.myBoard[coords.row][coords.col].draw(this.sideCtx, 30);
      this.hitCount += 1;

      if (this.hitCount === Game.SHIP_SQUARES_COUNT) {
        //TODO notify game over
        return "gameover"
      } else {
        ship.health -= 1;
        if (ship.health == 0) {
          return "sink";
        } else {
          return "hit";
        }
      }

    }
  }
  console.log("my board:", this.myBoard);
  this.myBoard[coords.row][coords.col].state = "miss";
  this.myBoard[coords.row][coords.col].draw(this.sideCtx, 30);
  return "miss";
};


Game.prototype.receiveMoveResult = function (moveResult) {
  console.log("Move result received:", moveResult)
  // The opponent has responded to a player's click
  var pos = this.myMoves[this.myMoves.length - 1];

  if (moveResult == "miss") {
    this.enemyBoard[pos.row][pos.col].state = "miss";
  } else {
    this.enemyBoard[pos.row][pos.col].state = "hit";
  }

  this.enemyBoard[pos.row][pos.col].draw(this.mainCtx, 60);
  this.isMyMove = false;
  return {message: Game.MESSAGES[moveResult]};
};

var Square = function (pos){
  this.pos = pos;
  this.topLeft = function (boxSize) {
    return {
      x: pos.col * boxSize,
      y: pos.row * boxSize
    };
  };
  this.state = "empty";
  this.isSelected = false;
}

Square.prototype.color = function () {
  if (this.isSelected) {return "rgba(200,200,200,0.5)";}
  switch (this.state) {
    case "empty":
      return "rgba(255,255,255,0.2)";
      break;
    case "ship":
      return "rgba(100,0,200, 0.5)";
      break;
    case "hit":
      return "rgba(255,0,0,0.5)";
      break;
    case "miss":
      return "rgba(0,255,0,0.5)";
  }
};

Square.prototype.draw = function (ctx, size) {
  ctx().clearRect(
    this.topLeft(size).x + 2,
    this.topLeft(size).y + 2,
    size - 4,
    size - 4
  );
  ctx().fillStyle = this.color();
  // console.log("color", this.color());
  // console.log("ctx", ctx);
//  console.log("topLeft", this.topLeft(size));
  ctx().fillRect(
    this.topLeft(size).x + 2,
    this.topLeft(size).y + 2,
    size - 4,
    size - 4
  );
}

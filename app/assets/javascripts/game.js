var Game = Battleships.Game = function (mainCanvas, sideCanvas) {
  this.mainCtx = mainCanvas.getContext("2d");
  this.sideCtx = sideCanvas.getContext("2d");
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
  "miss": "Missed!"
  "hit": "You HIT an enemy ship!"
  "sink": "Good shot! You SUNK an enemy ship!"
}

Game.prototype.setupEmptyBoard = function (board) {

  for (var r = 0; r < this.boardSize; r++) {
    var row = [];
    for (var c = 0; c < this.boardSize; c++) {
      row.push(new Square({row: r, col: c}));
    }
    board.push(row);
  }
}

Game.prototype.draw = function () {
  if (this.gameState == "in play") {
    for (var row in this.myBoard) {
      for (var sq in row) {
        sq.draw(this.sideCtx, 40);
      }
    }

    for (var row in this.enemyBoard) {
      for (var sq in row) {
        sq.draw(this.mainCtx, 80);
      }
    }
  } else {
    for (var row in this.myBoard) {
      for (var sq in this.myBoard[row]) {
        this.myBoard[row][sq].draw(this.mainCtx, 80);
      }
    }
  }
};

Game.prototype.posToCoords = function(pos) {
  var row = Math.floor(pos.y / 80);
  var col =  Math.floor(pos.x / 80);
  return {row: row, col: col};
}

Game.prototype.selectSq = function (pos) {
  var coords = this.posToCoords(pos);
  if (this.selected) {
    this.selected.isSelected = false;
    this.selected.draw(this.mainCtx, 80);
  }
  this.selected = this.myBoard[coords.row][coords.col]
  this.selected.isSelected = true;
  this.selected.draw(this.mainCtx, 80);
}

Game.prototype.addShip = function (bowPos, sternPos) {
  var bowCoords = this.posToCoords(bowPos);
  var sternCoords = this.posToCoords(sternPos);

  this.selected.isSelected = false;
  this.selected.draw(this.mainCtx, 80)
  this.selected = null;

  if(this.checkShipIsValid(bowCoords, sternCoords)){
    var rowDif = sternCoords.row - bowCoords.row;
    var colDif = sternCoords.col - bowCoords.col;
    var game = this;

    if (rowDif) {

      this.ships.push({
        bow: bowCoords,
        stern: sternCoords,
        health: Math.abs(rowDif)
      });

      var direction = (rowDif == Math.abs(rowDif)) ? 1 : -1;
      var i = 0;

      var loop = function () {
        console.log("shipping", bowCoords.row + i, bowCoords.col);
        game.myBoard[bowCoords.row + i][bowCoords.col].state = "ship";
        game.myBoard[bowCoords.row + i][bowCoords.col].draw(game.mainCtx, 80);

        i += direction;
        if (Math.abs(i) <= Math.abs(rowDif)) {
          setTimeout(loop, 50);
        }
      }
      loop();

    } else {
      this.ships.push({
        bow: bowCoords,
        stern: sternCoords,
        health: Math.abs(colDif)
      });

      var direction = (colDif == Math.abs(colDif)) ? 1 : -1;
      var i = 0;

      var loop = function () {
        console.log("shipping", bowCoords.row, bowCoords.col + i);
        game.myBoard[bowCoords.row][bowCoords.col + i].state = "ship";
        game.myBoard[bowCoords.row][bowCoords.col + i].draw(game.mainCtx, 80);
        i += direction;
        if (Math.abs(i) <= Math.abs(colDif)) {
          setTimeout(loop, 50);
        }
      }
      loop();
    }
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
}

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

    for (var i = 0; i < this.myMoves.length; i++) {
      if (this.myMoves[i].row == pos.row && this.myMoves[i].col == pos.col) {
        return {
          error: "You have already fired at this location!"
        };
      }
    }

    //TODO Display move
    this.myMoves.push(pos);
    return pos;

  }

};

Game.prototype.receiveMove = function (pos) {
  // The opponent has clicked on position pos

  for (shipIdx in this.myShips) {
    var ship = this.myShips[shipIdx];

    var minRow = Math.min(ship.bowCoords.row, ship.sternCoords.row);
    var maxRow = Math.max(ship.bowCoords.row, ship.sternCoords.row);

    var minCol = Math.min(ship.bowCoords.col, ship.sternCoords.col);
    var maxCol = Math.max(ship.bowCoords.col, ship.sternCoords.col);

    var shipHit = (
      pos.row >= minRow && pos.row <= maxRow &&
      pos.col >= minCol && pos.col <= maxCol
    );

    if (shipHit) {

      this.myBoard[pos.row][pos.col].state = "hit";
      this.hitCount += 1;

      if (this.hitCount === Game.SHIP_SQUARES_COUNT) {
        //TODO notify game over
        return "gameover"
      } else {
        ship.health -= 1;
        if (ship.health < 0) {
          return "sink";
        } else {
          return "hit";
        }
      }

    }
  }
  this.myBoard[pos.row][pos.col].state = "miss";
  return "miss";
};


Game.prototype.receiveMoveResult = function (moveResult) {
  // The opponent has responded to a player's click
  var pos = this.myMoves[this.myMoves.length - 1];

  if (moveResult == "miss") {
    this.enemyBoard[pos.row][pos.col].state = "miss";
  } else {
    this.enemyBoard[pos.row][pos.col].state = "hit";
  }

  this.enemyBoard[pos.row][pos.col].draw();
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
  if (this.isSelected) {return "#aaa";}
  switch (this.state) {
    case "empty":
      return "#59f";
      break;
    case "ship":
      return "#36c";
      break;
    case "hit":
      return "#f55";
      break;
    case "miss":
      return "#55f";
  }
};

Square.prototype.draw = function (ctx, size) {
  ctx.fillStyle = this.color();
  console.log("color", this.color())
  ctx.fillRect(
    this.topLeft(size).x + 1,
    this.topLeft(size).y + 1,
    size - 2,
    size - 2
  );
}

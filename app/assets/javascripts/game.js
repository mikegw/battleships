var Game = Battleships.Game = function (mainCanvas, sideCanvas) {
  this.mainCtx = mainCanvas.getContext("2d");
  this.sideCtx = sideCanvas.getContext("2d");
  this.ships = [];
  this.myBoard = [];
  this.enemyBoard = [];
  this.gameState = "add ships";
  this.shiptypes = [5,3,1];
  this.boardSize = 10;

  this.setupEmptyBoard(this.myBoard);
  this.setupEmptyBoard(this.enemyBoard);
  this.draw();
};

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
    this.ships.push({bow: bowCoords, stern: sternCoords});
    var rowDif = sternCoords.row - bowCoords.row;
    var colDif = sternCoords.col - bowCoords.col;
    var game = this;
    if (rowDif) {
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

Game.prototype.makeMove = function (pos) {
  // The player has clicked on a position pos

};

Game.prototype.receiveMove = function (pos) {
  // The opponent has clicked on position pos
};


Game.prototype.receiveMoveResult = function (result) {
  // The opponent has responded to a player's click
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

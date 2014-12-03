var Game = Battleships.Game = function (mainCanvas, sideCanvas) {
  this.mainCtx = mainCanvas.getContext("2d");
  this.sideCtx = sideCanvas.getContext("2d");
  this.ships = [];
  this.myBoard = [];
  this.enemyBoard = [];
  this.inPlay = false;
};

Game.prototype.draw = function () {
  if (this.inPlay) {
    for (var row in this.myBoard) {
      for (var sq in row) {
        sq.draw(this.sideCtx, 40);
      }
    }

    for (var row in this.enemyBoard) {
      for (var sq in row) {
        sq.draw(this.mainCtx, 60);
      }
    }
  } else {
    for (var row in this.myBoard) {
      for (var sq in row) {
        sq.draw(this.mainCtx, 60);
      }
    }
  }
};

Game.prototype.makeMove = function (pos) {

};

Game.prototype.receiveMove = function (pos) {

};

Game.prototype.addShipBow = function (pos) {

};

Game.prototype.addShipStern = function (pos) {

};

Game.prototype.receiveMoveResult = function (result) {

};

var Square = function (topLeft, boxSize){
  this.topLeft = topLeft;
  this.boxSize = boxSize;
  this.state = "empty";
}

Square.prototype.color = function () {
  switch (this.state) {
    case "empty":
      return grey;
    case "hit":
      return red;
    case "miss":
      return blue;
    }
  }
};

Square.prototype.draw = function (ctx, size) {
  ctx.fillStyle = this.color();
  ctx.fillRect(
    this.topLeft["x"],
    this.topLeft["y"],
    size,
    size
  );
}

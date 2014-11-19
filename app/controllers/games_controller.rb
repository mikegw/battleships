class GamesController < ApplicationController

  def show
    @game = Game.find(params(:id))
  end

  def index
  end

  def new
    @game = Game.new
  end

  def create
    @game = Game.new(game_params)
    if @game.save
      render :show
    else
      flash.now[:errors] = @game.errors.fullmessages
      render :new
    end
  end

  def update
    @game = Game.find(params(:id))
    if params[:move]
      @game.move(params[:move])
    elsif params[:add_ship]
      @game.add_ship(params[:add_ship])
    end
    render :show
  end

  def destroy
  end

  private

  def game_params
    params.require(:game).permit(:player1_id, :player2_id, :game_state)
  end

end

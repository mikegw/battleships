class GamesController < ApplicationController

  # before_filter :authenticate_user!, except: [:index]

  def show
    @game = Game.find(params[:id])
    render json: @game
  end

  def index
    @full_games = Game.where("player1_id IS NOT NULL AND player2_id IS NOT NULL")
    @open_games = Game.where.not("player1_id IS NOT NULL AND player2_id IS NOT NULL")
    render :index
  end

  def create
    @game = Game.new({player1_id: current_user.id})
    @game.game_state = @game.state.to_json
    if @game.save
      render :index
    else
      flash.now[:errors] = @game.errors.fullmessages
      render :index
    end
  end

  def update
    @game = Game.find(params[:id])
    color = current_user.id == @game.player1_id ? :red : :green

    if params[:move]
      @move = @game.move(params[:move])
    elsif params[:add_ship]
      @game.add_ship(params[:add_ship], color)
    elsif params[:join]
      @game.player2_id = current_user.id
    end

    unless @game.save
      puts "DANG"
      flash.now[:errors] = @game.errors.fullmessages
    end

    if @move == :game_over
      render :index
    else
      render json: @game
    end
  end

  def destroy
  end

  def join
    @game = Game.find(params[:id])
    if @game.player2_id
      flash[:errors] = @game.errors.fullmessages
      render :index
    else
      @game.player2_id = current_user.id
      if @game.save
        render json: @game
      else
        puts "DANG"
        flash.now[:errors] = @game.errors.fullmessages
        render :index
      end
    end
  end

end

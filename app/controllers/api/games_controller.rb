class Api::GamesController < ApplicationController

  # before_filter :authenticate_user!, except: [:index]

  def show
    @game = Game.find(params[:id])
    render json: @game
  end

  def index
    @full_games = Game.includes(:player1)
      .where("player1_id IS NOT NULL AND player2_id IS NOT NULL")
      .map do |game|
        {id: game.id, str: "#{game.player1.username}'s game"}
      end
    @open_games = Game.includes(:player1)
      .where.not("player1_id IS NOT NULL AND player2_id IS NOT NULL")
      .map do |game|
        {id: game.id, str: "#{game.player1.username}'s game"}
      end

    puts("\n\nOpen Games:")
    puts @open_games
    render :index
  end

  def create
    p params
    @game = Game.new({player1_id: current_user.id})
    @game.game_state = @game.state.to_json
    if @game.save
      Pusher.trigger("battleships", "open", {
        id: @game.id,
        str: "#{@game.player1.username}'s game"
      })
      render json: @game.id
    else
      render json: {errors: @game.errors.fullmessages, status: 422}
    end
  end

  def update
    @game = Game.find(params[:id])
    p params

    if params[:event] == "save"
      #TODO change the state of the game!!
      if @game.save
        puts "saved!"
        render json: "saved"
      else
        puts "failed to save!"
        render json: {errors: @game.errors.fullmessages, status: 422}
      end
    else
      channel = 'battleships' + params[:id].to_s
      Pusher.trigger(channel, params[:event], params[:event_data], {
        socket_id: params[:socket_id]
      })
      puts "message passed to opponent"
      render json: {sent: params[:event_data]}
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
      puts current_user
      @game.player2_id = current_user.id
      if @game.save
        puts "triggering 'full' on channel 'battleships'"
        Pusher.trigger("battleships", "full", {
          id: @game.id,
          str: "#{@game.player1.username}'s game"
        })

        channel = 'battleships' + params[:id].to_s
        puts "triggering 'opponent join' on channel '#{channel}''"
        Pusher.trigger(channel, "opponent join", @game.player2.username, {
          socket_id: params[:socket_id]
        })

        puts "deciding who goes first"
        to_move = rand(2) == 1 ? @game.player1 : @game.player2
        Pusher.trigger(channel, "to move", to_move.username, {
          socket_id: params[:socket_id]
        })

        render json: {id: @game.id, toMove: to_move.username}
      else
        render json: {errors: @game.errors.fullmessages, status: 422}
      end
    end
  end

end

class Game < ActiveRecord::Base

  def state
    @state ||= self.game_state ? (JSON.parse(self.game_state) : {
      redships: [],
      greenships: [],
      redmoves: [],
      greenmoves: []
    })
  end

  def current_player
    @current_player ||= :red
  end

  def add_ship(positions, color)
    bow = positions[0]
    stern = positions[1]

    length = [(bow[0] - stern[0]).abs, (bow[1] - stern[1]).abs].max


    return false unless bow[0] == stern[0] || bow[1] == stern[1]
    return false unless _check_intersections(bow, stern)

    state[(color.to_s + "ships").to_sym] << {
      bow: bow,
      stern: stern,
      condition: "_" * (length + 1)
    }

    return true
  end

  def move(move_arr)
    return false if state[(current_player.to_s + "moves").to_sym].include?(move_arr)

    state[(current_player.to_s + "moves").to_sym] << move_arr

    p state[(_other_player.to_s + "ships").to_sym]

    state[(_other_player.to_s + "ships").to_sym].each do |ship|
      if _hits_ship(move_arr, ship)
        puts "I got to line 42!"
        if ship[:condition].include?("_")
          _swap_current_player
          return :hit;
        else
          state[(_other_player.to_s + "ships").to_sym].each do |other_ship|
            return :sink if other_ship[:condition].include?("_")
          end
          return :gameover
        end
      end
    end
    game.game_state = state.to_json
    _swap_current_player
    true
  end

  private

  def _check_intersections(bow, stern)
    state[:redships].each do |ship|
      return false unless [bow[0], stern[0]].max < [ship[:bow][0], ship[:stern][0]].min ||
        [bow[0], stern[0]].min > [ship[:bow][0], ship[:stern][0]].max ||
        [bow[1], stern[1]].max < [ship[:bow][1], ship[:stern][1]].min ||
        [bow[1], stern[1]].min > [ship[:bow][1], ship[:stern][1]].max
    end
    return true
  end

  def _other_player
    ([:red, :green] - [current_player])[0]
  end

  def _swap_current_player
    @current_player = _other_player
  end

  def _hits_ship(move, ship)
    ["x", move[0], ship[:bow][0], move[0] == ship[:bow][0]]
    ["y", move[1], ship[:bow][1], move[1] == ship[:bow][1]]

    if ship[:bow][1] == ship[:stern][1] && move[1] == ship[:bow][1]
      min_pos = [ship[:bow][0], ship[:stern][0]].min
      max_pos = [ship[:bow][0], ship[:stern][0]].max
      (min_pos..max_pos).each do |pos|
        if pos == move[0]
          ship[:condition][pos - min_pos] = "h"
          puts "hit x"
          return true
        end
      end
    elsif ship[:bow][0] == ship[:stern][0] && move[0] == ship[:bow][0]
      min_pos = [ship[:bow][1], ship[:stern][1]].min
      max_pos = [ship[:bow][1], ship[:stern][1]].max
      (min_pos..max_pos).each do |pos|
        if pos == move[1]
          puts "hit y"
          ship[:condition][pos - min_pos] = "h"
          return true
        end
      end
    else
      puts "no hit"
      return false
    end
  end

end

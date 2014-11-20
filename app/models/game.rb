class Game < ActiveRecord::Base

  belongs_to :player1,
    class_name: "User",
    foreign_key: :player1_id

  belongs_to :player2,
    class_name: "User",
    foreign_key: :player2_id


  def state
    @state ||= self.game_state ? parse_json_hash(self.game_state) : {
      redships: [],
      greenships: [],
      redmoves: [],
      greenmoves: []
    }
  end

  def current_player
    @current_player ||= _calculate_current_player
  end

  def add_ship(positions, color)
    positions = parse_json_hash(positions) if positions.class == String
    bow = positions[0]
    stern = positions[1]

    length = [(bow[0] - stern[0]).abs, (bow[1] - stern[1]).abs].max


    unless bow[0] == stern[0] || bow[1] == stern[1]
      puts "wonky ship"
      return false
    end

    unless _check_intersections(bow, stern, color)
      puts "intersect"
      return false
    end

    state[(color.to_s + "ships").to_sym] << {
      bow: bow,
      stern: stern,
      condition: "_" * (length + 1)
    }
    self.game_state = state.to_json
    return true
  end

  def move(move_arr)
    p state
    return false if state[(current_player.to_s + "moves").to_sym].include?(move_arr)

    state[(current_player.to_s + "moves").to_sym] << move_arr

    p state[(_other_player.to_s + "ships").to_sym]

    state[(_other_player.to_s + "ships").to_sym].each do |ship|
      if _hits_ship(move_arr, ship)
        puts "I got to line 42!"
        if ship[:condition].include?("_")
          _swap_current_player
          self.game_state = state.to_json
          return :hit;
        else
          state[(_other_player.to_s + "ships").to_sym].each do |other_ship|
            self.game_state = state.to_json
            return :sink if other_ship[:condition].include?("_")
          end
          self.game_state = state.to_json
          return :gameover
        end
      end
    end
    self.game_state = state.to_json
    _swap_current_player
    true
  end

  private

  def _check_intersections(bow, stern, color)
    puts state
    state[(color.to_s + "ships").to_sym].each do |ship|
      return false unless [bow[0], stern[0]].max < [ship[:bow][0], ship[:stern][0]].min ||
        [bow[0], stern[0]].min > [ship[:bow][0], ship[:stern][0]].max ||
        [bow[1], stern[1]].max < [ship[:bow][1], ship[:stern][1]].min ||
        [bow[1], stern[1]].min > [ship[:bow][1], ship[:stern][1]].max
    end
    return true
  end


  def _calculate_current_player
    (state[:redmoves].count - state[:greenmoves].count) % 2 == 0 ? :red : :green
  end

  def _other_player
    ([:red, :green] - [current_player])[0]
  end

  def _swap_current_player
    @current_player = _other_player
  end

  def _hits_ship(move, ship)
    puts ship
    p ["x", move[0], ship[:bow][0], move[0] == ship[:bow][0]]
    p ["y", move[1], ship[:bow][1], move[1] == ship[:bow][1]]

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

  def parse_json_hash(json_hash)
    h = JSON.parse(json_hash)
    symbolize_hash(h)
  end

  def symbolize_hash(old_hash)
    new_hash = {}

    old_hash.each_pair do |k,v|
      if v.class == Hash
        new_hash[k.to_sym] = symbolize_hash(v)
      elsif v.class == Array
        new_arr = []
        v.each do |el|
          if el.class == Hash
            new_arr << symbolize_hash(el)
          else
            new_arr << el
          end
        end
        new_hash[k.to_sym] = new_arr
      else
        new_hash[k.to_sym] = v
      end
    end

    return new_hash
  end

end

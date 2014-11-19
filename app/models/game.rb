class Game < ActiveRecord::Base

  def state
    self.state ||= {
      redboats: [],
      greenboats: [],
      moves: []
    }
  end
  #
  # def make_move
  # end
end

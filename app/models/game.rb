class Game < ActiveRecord::Base

  def state
    @state ||= {
      redships: [],
      greenships: [],
      redmoves: [],
      greenmoves: []
    }
  end

end

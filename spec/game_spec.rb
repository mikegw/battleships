require 'spec_helper'
require 'rails_helper'

describe Game do

  before :each do
    game = FactoryGirl.create(:game)
  end

  it "starts with an empty gamestate" do
    expect(game.state).to eq({
      redships: [],
      greenships: [],
      redmoves: [],
      greenmoves: []
    })
  end

  context "creating ships" do

    it "allows you to create ships" do
      game.add_redship [[3, 6], [5, 6]]
      expect(game.state[:redships]).to eq(
        [
          {
            bow: [3, 6],
            stern: [5, 6],
            condition: "nnnn"
          }
        ]
      )
    end

    it "forces ships to be placed horizontally or vertically" do
      expect(game.add_redship [[4, 5], [6, 7]]).to eq(false)
    end

    it "doesn't allow you to place ships on top of each other" do
      game.add_redship [[3, 6], [5, 6]]
      expect(game.add_redship [[1, 2], [2, 2]]).to eq(true)
      expect(game.add_redship [[4, 5], [4, 7]]).to eq(false)
    end

  end


  context "when there are ships" do

    before :each do
      game.add_redship [[3, 6], [5, 6]]
    end

    it "starts with the red player" do
      expect(game.current_player).to eq(:red)
    end


    it "allows you to make moves" do
      game.move([8, 8])
      expect(game.state.redmoves).to eq([[8, 8]])
      expect(game.state.greenmoves).to eq([])
    end

    it "alternates which players turn it is" do
      game.move([8, 8])
      game.move([4, 3])
      expect(game.state.greenmoves).to eq([[4, 3]])
    end


    it "doesn't allow invalid moves" do
      game.move([8, 8])
      game.move([3, 3])
      expect(game.move([3, 6])).to eq(false)
      game.move([8, 8]).to eq(false)
    end


    it "tells you if you hit a ship" do
      game.move([8, 8])
      expect(game.move([3,6])).to eq(:hit)
    end

    it "tells you if you sink a ship" do
      game.add_greenship([[0, 0], [0, 0]])
      game.add_greenship([[1, 1], [1, 4]])
      expect(game.move([0, 0])).to eq(:sink)
    end

    it "announces the end of the game" do
      game.add_greenship([[0, 0], [0, 0]])
      expect(game.move([0, 0])).to eq(:gameover)
    end

  end


end

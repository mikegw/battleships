FactoryGirl.define do
  factory :game do
    player1_id 5
    player2_id 12
    game_state ({redships: [], greenships: [], redmoves: [], greenmoves: []}.to_json)
  end
end

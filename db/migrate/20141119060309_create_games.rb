class CreateGames < ActiveRecord::Migration
  def change
    create_table :games do |t|
      t.integer :player1_id, null: false
      t.integer :player2_id, null: false
      t.text :game_state

      t.timestamps
    end

    add_index :games, [:player1_id, :player2_id]
  end
end

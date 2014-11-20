Rails.application.routes.draw do

  devise_for :users
  root to: "games#index"

  resources :games, except: :edit
  get "games/:id/join", as: :join_game, to: "games#join"

end

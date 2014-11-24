Rails.application.routes.draw do

  root to: "games#index"

  resources :games, except: :edit
  get "games/:id/join", as: :join_game, to: "games#join"

  namespace :api, defaults: {format: :json} do
    devise_scope :user do
      resources :sessions, only: [:create, :destroy]
    end
  end
end

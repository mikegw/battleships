Rails.application.routes.draw do

  root to: "games#index"

  resources :games, except: :edit
  get "games/:id/join", as: :join_game, to: "games#join"

  resources :users

  resource :session

  namespace :api, defaults: {format: :json} do
    resource :session, only: [:create, :destroy]
    resources :users, only: [:index, :show, :create] do
      collection do
        get "current"
      end
    end
    resources :games
    get "games/:id/join", as: :join_game, to: "games#join"
  end
end

Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :admin do
    post 'login', to: 'sessions#create'
    delete 'logout', to: 'sessions#destroy'
    get 'session', to: 'sessions#show'

    resources :inventory, only: [:index, :show, :create, :update, :destroy]
    resources :promotions, only: [:index, :show, :create, :update, :destroy]
  end
end

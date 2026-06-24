Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  resources :products, only: [ :index, :show ]
  resources :promotions, only: [ :index ]

  resource :cart, only: [ :show ], controller: :carts do
  post :items, to: "carts#add_item"
  delete "items/:id", to: "carts#remove_item"
  patch "items/:id", to: "carts#update_quantity"
  delete "/", to: "carts#clear"
end

  namespace :api do
    post "checkout", to: "checkout#create"
    post "coupons/validate", to: "coupons#validate"
  end

  namespace :admin do
    post "login", to: "sessions#create"
    delete "logout", to: "sessions#destroy"
    get "session", to: "sessions#show"

    resources :inventory, only: [ :index, :show, :create, :update, :destroy ]
    resources :promotions, only: [ :index, :show, :create, :update, :destroy ]
    resources :orders, only: [ :index, :show ]
    get "analytics", to: "analytics#index"
  end
end

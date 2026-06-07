Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  resources :products, only: [:index, :show]
  resources :promotions, only: [:index]

  namespace :api do
    post 'checkout', to: 'checkout#create'

    resources :saved_payment_methods, only: [:index, :create, :destroy] do
      member do
        patch :default
      end
    end
  end

  namespace :admin do
    post 'login', to: 'sessions#create'
    delete 'logout', to: 'sessions#destroy'
    get 'session', to: 'sessions#show'

    resources :inventory, only: [:index, :show, :create, :update, :destroy]
    resources :promotions, only: [:index, :show, :create, :update, :destroy]
  end
end

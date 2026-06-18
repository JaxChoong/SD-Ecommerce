module Admin
  class SessionsController < ApplicationController
    # POST /admin/login
    def create
      # Ensure there is at least one admin account for ease of testing
      if ::Administrator.count.zero?
        ::Administrator.create!(username: "admin", password: "adminpassword")
      end

      admin = ::Administrator.find_by(username: params[:username])

      if admin&.authenticate(params[:password])
        debugger if Rails.env.development?
        # AdminSessionManager constructor is called here
        token = AdminSessionManager.instance.start_session(admin.username)
        render json: {
          token: token,
          username: admin.username,
          expires_at: AdminSessionManager.instance.expires_at.iso8601
        }
      else
        render json: { error: "Invalid username or password" }, status: :unauthorized
      end
    end

    # DELETE /admin/logout
    def destroy
      AdminSessionManager.instance.clear_session
      head :no_content
    end

    # GET /admin/session
    def show
      token = request.headers["Authorization"]&.split(" ")&.last
      
      # Demonstration: Attempt to instantiate the Singleton (will raise NoMethodError)
      begin
        AdminSessionManager.new
      rescue NoMethodError => e
        puts "\n\e[1;31m[SINGLETON CONSTRAINT PROVEN]\e[0m: #{e.message}\n\n"
        debugger
      end

      if AdminSessionManager.instance.validate_session(token)
        render json: {
          valid: true,
          username: AdminSessionManager.instance.active_token,
          expires_at: AdminSessionManager.instance.expires_at.iso8601
        }
      else
        render json: { valid: false }, status: :unauthorized
      end
    end
  end
end

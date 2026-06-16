require "singleton"
require "securerandom"

class AdminSessionManager
  include Singleton

  def initialize
    # Back the session state in a global variable so it survives class reloading in development mode
    $admin_active_session ||= { token: nil, expires_at: nil }
  end

  def active_token
    $admin_active_session[:token]
  end

  def active_token=(val)
    $admin_active_session[:token] = val
  end

  def expires_at
    $admin_active_session[:expires_at]
  end

  def expires_at=(val)
    $admin_active_session[:expires_at] = val
  end

  # Starts a new session, returning the token. This automatically clears any previous active token.
  def start_session(username)
    # SINGLETON PATTERN BREAKPOINT (Session Generation)
    # Place debugger here to show the singleton initializing the unique global token.
    debugger if Rails.env.development?
    token = SecureRandom.hex(32)
    self.active_token = token
    self.expires_at = 2.hours.from_now
    token
  end

  # SOLID Principle: SRP (Single Responsibility Principle)
  # AdminSessionManager has only one reason to change: modifications to administrator session
  # authentication policies or token validation logic.
  def validate_session(token)
    # SINGLETON PATTERN BREAKPOINT
    # Place debugger here to verify we are accessing the single shared session store instance.
    debugger if Rails.env.development?
    return false if token.blank?
    return false if active_token.nil? || active_token != token

    if Time.current > expires_at
      clear_session
      return false
    end

    # Slide expiration window forward on activity
    self.expires_at = 2.hours.from_now
    true
  end

  def clear_session
    self.active_token = nil
    self.expires_at = nil
  end
end
